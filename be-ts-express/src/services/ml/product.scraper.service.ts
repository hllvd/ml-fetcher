import { ScrapeType } from "../../enums/scrap-type.enum"
import { webScrapProductMetadata } from "./scraper/predicate/product/product-metadata.predicate.service"
import { webScrapeMlPage } from "./scraper/web.scraper.service"

export const productScraper = async (
  productId: string
): Promise<{
  currentPrice: number
  quantitySold: number
  hasVideo: boolean
}> => {
  if (!productId.includes("-")) {
    throw new Error("Invalid product id")
  }
  const result = await webScrapeMlPage(webScrapProductMetadata, {
    productId,
    scrapeType: ScrapeType.ProductPage,
  })
  return result
}
