import { NextFunction, Response } from "express"
import {
  PersistencyInfo,
  RequestExtended,
} from "../models/extends/params/request-custom.model"
import { searchItems } from "../services/ml/search.service"

const items = async (
  req: RequestExtended,
  _res: Response,
  next: NextFunction
) => {
  const categoryId = req.query?.categoryId?.toString()
  const userId = req.query?.userId?.toString() ?? "1231084821"
  const searchTerm = req.query?.searchTerm?.toString() ?? ""
  const categoryItems = await searchItems({
    categoryId,
    searchTerm,
    userId,
  })

  req.persistency = {} as PersistencyInfo
  req.persistency.searchResultsInfo = { ...categoryItems }
  next()
}

export default { items }
