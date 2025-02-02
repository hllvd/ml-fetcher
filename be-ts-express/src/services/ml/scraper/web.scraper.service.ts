import axios from "axios"
import { ScrapeType } from "../../../enums/scrap-type.enum"
import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import {
  ensureTrailingSlash,
  minimalPathUrl,
  searchUrlGenerator,
} from "../../../utils/url.util"

/**
 * read more https://scrapfly.io/blog/web-scraping-with-nodejs/
 * @param predicateSelector
 * @param options
 * @returns
 */
interface WebScraperMlPageOption {
  scrapeType: ScrapeType
  page?: number
  catalogId?: string
  productId?: string
  categoryId?: string
  searchUrl?: string
  categoryUrl?: string
  maxPage?: number | null
  dynamicWeb?: boolean
  searchTerm?: string
}
const webScrapeMlPage = async <T>(
  predicateSelector: Function,
  options?: WebScraperMlPageOption
): Promise<any | T> => {
  const r = await fetchWithRetry<T>({
    options,
    retries: 10,
    predicateSelector,
  })
  return r
}

const fetchWithRetry = async <T>({
  options,
  retries,
  predicateSelector,
}: {
  options: WebScraperMlPageOption
  retries: number
  predicateSelector: Function
}): Promise<{
  pages: Array<string>
  result: Array<{ productIdStr: string; price: number } | T>
}> => {
  const { maxPage, dynamicWeb } = options
  const urlBuilder = webScrapeMlUrlBuilder(options)
  let result: Array<any> = []
  const pages: Array<string> = []
  let areTherePages = true
  let currentPageIndex: number = 1
  while (areTherePages) {
    try {
      const currentPageUrl = urlBuilder.getCurrentUrl()
      pages.push(currentPageUrl)
      const response = dynamicWeb
        ? await webScrapeFetcherDynamic(currentPageUrl, retries)
        : await webScrapeFetcher(currentPageUrl, retries)

      const { nextPage, response: currentPageResult } = await predicateSelector(
        response,
        currentPageIndex
      )

      if (!Array.isArray(currentPageResult))
        return { result: currentPageResult, pages }

      if (currentPageResult == null)
        throw new Error("Predicate response is null")
      result = [...result, ...currentPageResult]

      if (currentPageIndex === maxPage) break
      currentPageIndex++
      if (!nextPage) break
      urlBuilder.nextPage(nextPage)
    } catch (e) {
      console.error(e)
      areTherePages = false
    }
  }
  return { result, pages }
}
const webScrapeFetcherDynamic = async (url: string, retries: number) => {
  let counter = 0
  let response = null
  const outputFolder =
    "/Users/hudsonvandal/Documents/ml-search-result/be-ts-express"
  console.log("dynamic Web", url)
  while (counter < retries) {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto(url, { waitUntil: "networkidle2" })
      console.log("goto", url)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      await page.setViewport({ width: 1080, height: 1024 })

      response = await page.content()
      console.log("page url", await page.url())
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true })
      }

      // Save the HTML content to a file
      const htmlFilePath = path.join(outputFolder, "page.html")
      fs.writeFileSync(htmlFilePath, response)
      console.log(`HTML content saved to ${htmlFilePath}`)

      // Save a screenshot of the page
      const screenshotFilePath = path.join(outputFolder, "screenshot.png")
      await page.screenshot({ path: screenshotFilePath, fullPage: true })
      console.log(`Screenshot saved to ${screenshotFilePath}`)
      await browser.close()
      break
    } catch {
      counter++
    }
  }
  return response
}

export const webScrapeFetcher = async (url: string, retries: number) => {
  let counter = 0
  let response = null
  console.log("scrap", url)
  while (counter < retries) {
    try {
      response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/png,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          Connection: "keep-alive",
          Cookie:
            "_d2id=1f00ab5f-a2e6-462c-841c-ae14bfb8852d-n; _csrf=8MhIQ1H-izdSvameUPOAE08T; c_ui-navigation=6.6.92",
        },
        maxRedirects: 3, // This tells Axios not to follow redirects
      })
      break
    } catch {
      counter++
    }
  }
  console.log("response url", response.config.url)
  return response
}

const webScrapeMlUrlBuilder = (options) => {
  let currentPage
  let isPagerWorking = true
  let page = options.page ?? 1
  const { catalogId, productId, categoryUrl, searchTerm } = options

  const getCurrentUrlScope = () => {
    switch (options.scrapeType) {
      case ScrapeType.CatalogProductList:
        currentPage = `https://www.mercadolivre.com.br/p/${catalogId}/s?page=${page}`
        return currentPage
      case ScrapeType.CatalogMetadata:
        isPagerWorking = false
        currentPage = `https://www.mercadolivre.com.br/p/${catalogId}`
        return currentPage
      case ScrapeType.ProductPage:
        isPagerWorking = false
        currentPage = `https://produto.mercadolivre.com.br/${productId}`
        return currentPage
      case ScrapeType.CategoryProductList:
        isPagerWorking = true
        currentPage = `${categoryUrl}`
        return currentPage
      case ScrapeType.CategoryMetadata:
        isPagerWorking = false
        currentPage = `${ensureTrailingSlash(categoryUrl)}`
        return currentPage
      case ScrapeType.SearchMetadata:
        const baseUrl = `https://lista.mercadolivre.com.br`
        const searchTermWithBaseUrl = searchUrlGenerator({
          searchTerm,
          baseUrl,
        })
        currentPage = minimalPathUrl(searchTermWithBaseUrl)
        return currentPage
      case ScrapeType.CategoryChildren:
        isPagerWorking = false
        const url = new URL(categoryUrl)
        const { protocol, hostname, pathname } = url
        const pathWithoutNovoAndUnderscore = pathname
          .replace(/\/novo\/?/, "")
          .split("_")[0]
        const removeDoubleSlash = pathWithoutNovoAndUnderscore.replace(
          /([^:]\/)\/+/g,
          "$1"
        )
        const clearUrl = `${protocol}//${hostname}${removeDoubleSlash}`
        currentPage = `${clearUrl}/_NoIndex_True?original_category_landing=true`
        return currentPage
      case ScrapeType.CategoryRoot:
        isPagerWorking = false
        currentPage = `https://www.mercadolivre.com.br/categorias`
        return currentPage
      default:
        throw new Error("Invalid scrape type")
    }
  }
  return {
    getCurrentUrl: () => currentPage ?? getCurrentUrlScope(),
    nextPage: (url?: string) => {
      if (url) {
        currentPage = url
        return currentPage
      }
    },
  }
}

export { webScrapeMlPage }
