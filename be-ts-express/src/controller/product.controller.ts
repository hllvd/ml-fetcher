import { NextFunction, Response } from "express"
import { controller, httpGet } from "inversify-express-utils/lib/decorators"
import {
  PersistencyInfo,
  RequestExtended,
} from "../models/extends/params/request-custom.model"

import { getProductVisitsSummary } from "../services/ml/products-visits.service"
import { getFullProduct } from "../services/ml/products.service"

@controller("/product")
export class ProductController {
  @httpGet("/")
  public async product(
    req: RequestExtended,
    res: Response,
    next: NextFunction
  ) {
    const productId = req.query?.productId?.toString()
    const userId = req.query?.userId?.toString() ?? "1231084821"

    const productInfo = await getFullProduct({
      productId,
      userId,
    })

    req.persistency = {} as PersistencyInfo
    req.persistency.productInfo = { ...productInfo, productId }
    next()
    console.log("GO NEXT from product controller")
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
