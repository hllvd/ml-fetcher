import { ScrapeType } from "../../enums/scrap-type.enum"
import { webScrapeCatalogToMetadataPredicate } from "./scraper/predicate/catalog/catalog-metadata.predicate.service"
import { webScrapeCatalogProductLengthPredicate } from "./scraper/predicate/catalog/catalog-product-lengths.predicate.service"
import { webScrapeCatalogToProductIdAndPricePredicate } from "./scraper/predicate/catalog/catalog-productIds-price.predicate.service"
import { webScrapeMlPage } from "./scraper/web.scraper.service"

export const catalogScraper = async (
  catalogId: string,
  { maxPage = 1 } = {}
) => {
  const { result: productList } = await webScrapeMlPage(
    webScrapeCatalogToProductIdAndPricePredicate,
    {
      catalogId,
      scrapeType: ScrapeType.CatalogProductList,
      maxPage,
    }
  )
  const { result: productMetadata } = await (<
    Promise<{
      result: {
        hasVideo: boolean
        productSales: number | null
        catalogProductLength: number | null
      }
    }>
  >webScrapeMlPage(webScrapeCatalogToMetadataPredicate, {
    catalogId,
    scrapeType: ScrapeType.CatalogMetadata,
  }))
  const { hasVideo, productSales } = productMetadata
  let { catalogProductLength: productLength } = productMetadata

  // Try to get length o catalog products by webScrapeCatalogToMetadataPredicate, if we don't have this number, we try it by calling webScrapeCatalogProductLengthPredicate
  if (!productLength) {
    const { result: resultCatalogProductLength } = await webScrapeMlPage(
      webScrapeCatalogProductLengthPredicate,
      {
        catalogId,
        scrapeType: ScrapeType.CatalogProductList,
      }
    )
    productLength = resultCatalogProductLength
  }

  return { productLength, productList, hasVideo, productSales }
}
