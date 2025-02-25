import { NextFunction, Response } from "express"
import { controller, httpGet } from "inversify-express-utils/lib/decorators"
import { inject } from "inversify"
import { ProductService } from "../services/ml/products.service"
import {
  PersistencyInfo,
  RequestExtended,
} from "../models/extends/params/request-custom.model"
import { TYPES } from "../types"

import { getProductVisitsSummary } from "../services/ml/products-visits.service"

@controller("/product")
export class ProductController {
  constructor(
    @inject(TYPES.ProductService)
    private readonly productService: ProductService
  ) {}
  @httpGet("/")
  public async product(
    req: RequestExtended,
    res: Response,
    next: NextFunction
  ) {
    const productIds = [req.query?.productId?.toString()]
    const userId = req.query?.userId?.toString() ?? "1231084821"

    const productInfo = await this.productService.getFullProducts({
      productIds,
      userId,
    })

    res.status(200).json([...productInfo])
  }

  @httpGet("/views")
  public async views(req: RequestExtended, res: Response, next: NextFunction) {
    const productId = req.query?.productId?.toString()
    const userId = req.query?.userId?.toString() ?? "1231084821"

    const catalogVisitsSummary = await getProductVisitsSummary({
      userId,
      productId,
    })

    if (!req.persistency) {
      req.persistency = {} as PersistencyInfo
      req.persistency.productViewInfo = { ...catalogVisitsSummary, productId }
      next()
    }
  }
}
