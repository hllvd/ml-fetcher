import { Request, Response } from "express"
import { ScrapeType } from "../enums/scrap-type.enum"
import { getCatalogVisitsSummary } from "../services/ml/catalog-visits.service"
import { catalogSummary } from "../services/ml/catalog.service"
import { webScrapeCatalogToProductIdAndPricePredicate } from "../services/ml/scraper/predicate/catalog/catalog-productIds-price.predicate.service"
import { webScrapeMlPage } from "../services/ml/scraper/web.scraper.service"

/** Catalog info
 * - Densidade de Líder
 * - Densidade Mercado Gold
 * - Densidade Mercado Platinum
 * - Densidade Full
 * - Densidade coleta
 * - Dispersão preços
 * - Maior preço
 * - Menor preço
 * - Preço Média
 * - Quanto faturou
 * - catalog_old_post Anuncio mais antigo
 * - Categorias relacionadas (vasculhar em todos os anuncios )
 * - catalog_title
 * - catalog_brand
 * - product_id
 * -
 * - summary_created
 * - summary_userId
 * - summary_ttl
 */

const catalog = async (req: Request, res: Response) => {
  const catalogId = req.query?.catalogId?.toString()
  const userId = req.query?.userId?.toString() ?? "1231084821"

  const { catalogReducerValues } = await catalogSummary({
    catalogId,
    userId,
  })

  res.status(200).json({
    catalogId,
    ...catalogReducerValues,
  })
}

const views = async (req: Request, res: Response) => {
  const catalogId = req.query?.catalogId?.toString()
  const userId = req.query?.userId?.toString() ?? "1231084821"
  const productList: Array<{ productIdStr: string }> = await webScrapeMlPage(
    webScrapeCatalogToProductIdAndPricePredicate,
    {
      catalogId,
      scrapeType: ScrapeType.CatalogProductList,
      maxPage: 1,
    }
  )

  console.log("productList.length", productList.length)
  const catalogVisitsSummary = await getCatalogVisitsSummary({
    userId,
    productIds: productList,
  })
  res.status(200).json({
    ...catalogVisitsSummary,
  })
}

export default { catalog, views }
