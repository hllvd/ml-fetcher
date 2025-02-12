import { CatalogApiResponse } from "../../models/api-response/api/catalog-response.models"
import { CatalogReducerResponse } from "../../models/reducers/catalog-reducer.models"
import { roundNumber } from "../../utils/math.util"
import { catalogScraper } from "./catalog-scraper.service"

import {
  calculateCommissions,
  getProductInCorrectOrder,
  getProducts,
} from "./products.service"
import { catalogReducer } from "./reducers/catalog.reducer.service"
import { getProductSellers } from "./seller.service"

const catalogSummary = async ({
  catalogId,
  userId,
}): Promise<CatalogApiResponse> => {
  const {
    productList,
    hasVideo: hasVideoInProductMetadata,
    quantitySold,
    productLength,
  } = await catalogScraper(catalogId, { maxPage: 1 })

  const amountOfProducts = productLength

  console.log("hasVideoInProductMetadata", hasVideoInProductMetadata)
  console.log("productList", productList)
  console.log("quantitySold", quantitySold)
  console.log("productLength", productLength)
  console.log("amountOfProducts", amountOfProducts)
  const productListOnlyIds = productList.map((e) => e.productIdStr)
  const products = await getProducts(userId, productListOnlyIds)
  const productsWithSellers = await getProductSellers({ userId, products })

  const productsWithSellersInCorrectOrder = getProductInCorrectOrder(
    productListOnlyIds,
    productsWithSellers
  )

  const productsWithSellersAndPricesInCorrectOrder =
    productsWithSellersInCorrectOrder.map((p, i) => ({
      ...p,
      price: productList[i].price,
    }))

  const productsWithSellersPricesAndAmountInCorrectOrder =
    productsWithSellersAndPricesInCorrectOrder.map((p) => ({
      ...p,
    }))

  const catalogReducerValues = catalogReducer(
    productsWithSellersPricesAndAmountInCorrectOrder
  )

  const catalogReducerWithSummary = _summarizeCatalog({
    catalog: { ...catalogReducerValues, length: amountOfProducts },
    sales: quantitySold,
  })

  return {
    catalogId,
    ...catalogReducerWithSummary,
    hasVideo: hasVideoInProductMetadata,
  }
}

const _summarizeCatalog = (options: {
  catalog: CatalogReducerResponse
  sales: number
}) => {
  const revenue = options.sales * options?.catalog?.price?.best

  const dateCreated = new Date(options?.catalog?.dateCreated) ?? null
  const today = new Date()
  const timeDiff = today.getTime() - dateCreated.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  const dailyRevenue = roundNumber(revenue / daysDiff)
  const commissions = calculateCommissions(options?.catalog?.price?.best)

  const catalogWithSummary = {
    ...options.catalog,
    revenue,
    dailyRevenue,
    quantitySold: options.sales,
    commissions,
  }
  return catalogWithSummary
}

export { catalogSummary }
