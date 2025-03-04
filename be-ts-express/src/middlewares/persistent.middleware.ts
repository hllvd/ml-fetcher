import { NextFunction, Response } from "express"
import { RequestExtended } from "../models/extends/params/request-custom.model"

import {
  saveCatalogViewsDb,
  saveProductViewToDb,
} from "../services/persistence/views.persistence"

const persistentMiddleware = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  console.log("persistentMiddleware 1")
  const {
    productInfo = null,
    catalogInfo = null,
    catalogViewsInfo = null,
    productViewInfo = null,
    searchResultsInfo = null,
  } = req.persistency || {}
  console.log("persistentMiddleware 2")

  try {
    console.log("persistentMiddleware 4")
    // if (productInfo) await saveProductToDb(productInfo)
    // if (catalogInfo) await saveCatalogToDb(catalogInfo)
    // if (catalogViewsInfo) await saveCatalogViewsDb(catalogViewsInfo)
    // if (productViewInfo) await saveProductViewToDb(productViewInfo)
    // if (searchResultsInfo) await saveSearchResultToDb(searchResultsInfo)
    console.log("persistentMiddleware 5")
  } catch (e) {
    console.log("persistentMiddleware 6")
    console.log(e)
  } finally {
    console.log("persistentMiddleware 7")
    console.log("finally")
    next()
  }
}

export { persistentMiddleware }
