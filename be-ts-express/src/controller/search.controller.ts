import { NextFunction, Response } from "express"
import { controller, httpGet } from "inversify-express-utils/lib/decorators"
import {
  PersistencyInfo,
  RequestExtended,
} from "../models/extends/params/request-custom.model"
import { searchItems } from "../services/ml/search.service"

@controller("/search")
export class SearchController {
  @httpGet("/")
  public async items(req: RequestExtended, _res: Response, next: NextFunction) {
    const categoryId = req.query?.categoryId?.toString()
    const userId = req.query?.userId?.toString() ?? "1231084821"
    const searchTerm = req.query?.searchTerm?.toString() ?? ""
    const categoryItems = await searchItems({
      categoryId,
      searchTerm,
      userId,
    })

    _res.status(200).json({ ...categoryItems })
    req.persistency = {} as PersistencyInfo
    req.persistency.searchResultsInfo = { ...categoryItems }
    next()
  }
}
