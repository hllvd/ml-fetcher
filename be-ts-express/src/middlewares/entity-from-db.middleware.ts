import { NextFunction, Response } from "express"
import { RequestExtended } from "../models/extends/params/request-custom.model"

const entityFromDbMiddleware = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  const requestPath = req.path
  const productId =
    req.query?.productId?.toString() ?? req.query.catalogId?.toString()

  if (requestPath.includes("views")) return next() // Skip views endpoint

  // const productCatalogFromDb = await productsCatalogsRepository.get(productId)
  // const daysToExpire = 30
  // const expireDate: Date = productCatalogFromDb?.metadataUpdatedAt
  //   ? new Date(productCatalogFromDb.metadataUpdatedAt)
  //   : new Date("1988-05-02")
  // expireDate.setDate(expireDate.getDate() + daysToExpire)
  // expireDate > new Date()
  //   ? res.status(200).json({ ...productCatalogFromDb })
  //   : next()
}
export { entityFromDbMiddleware }
