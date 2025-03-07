import { NextFunction, Request, Response } from "express"
import { inject } from "inversify"
import { controller, httpGet } from "inversify-express-utils"
import { ScrapeType } from "../enums/scrap-type.enum"
import {
  PersistencyInfo,
  RequestExtended,
} from "../models/extends/params/request-custom.model"
import { getCatalogVisitsSummary } from "../services/ml/catalog-visits.service"
import { CatalogService } from "../services/ml/catalog.service"
import { webScrapeCatalogToProductIdAndPricePredicate } from "../services/ml/scraper/predicate/catalog/catalog-productIds-price.predicate.service"
import { webScrapeMlPage } from "../services/ml/scraper/web.scraper.service"
import { TYPES } from "../types"

@controller("/catalog")
export class CatalogController {
  constructor(
    @inject(TYPES.ICatalogService)
    private readonly catalogService: CatalogService
  ) {}

  @httpGet("/")
  public async catalog(
    req: RequestExtended & { catalogResponse: any },
    res: Response,
    next: NextFunction
  ) {
    const catalogId = req.query?.catalogId?.toString()
    const userId = req.query?.userId?.toString() ?? "1231084821"

    const catalogSummaryResponse = await this.catalogService.catalogSummary({
      catalogId,
      userId,
    })

    res.status(200).json({ ...catalogSummaryResponse })

    const response = {
      // ...catalogSummaryResponse,
    }
    req.persistency = {} as PersistencyInfo
    // req.persistency.catalogInfo = response

    next()
  }

  @httpGet("/views")
  public async views(
    req: RequestExtended & { catalogResponse: any },
    res: Response,
    next: NextFunction
  ) {
    const catalogId = req.query?.catalogId?.toString()
    const userId = req.query?.userId?.toString() ?? "1231084821"
    const { result: productList } = await webScrapeMlPage(
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
      catalogId,
    })

    if (!req.persistency) {
      req.persistency = {} as PersistencyInfo
      req.persistency.catalogViewsInfo = { ...catalogVisitsSummary, catalogId }
      next()
    }
  }
}
