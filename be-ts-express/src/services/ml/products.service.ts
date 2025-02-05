import { ScrapeType } from "../../enums/scrap-type.enum"
import { ProductApiResponse } from "../../models/api-response/api/product-response.models"
import { MlProductExtraFields } from "../../models/dto/ml-product-extra-fields.models"
import {
  MLProduct,
  MLProductCommission,
  ProductId,
} from "../../models/dto/ml-product.models"
import {
  FetchProductArgument,
  FetchProductsArgument,
} from "../../models/params/fetch-product.model"
import { calculateDaysFrom } from "../../utils/day-calculation.util"
import { roundNumber } from "../../utils/math.util"
import { convertCatalogIdToProductId } from "../../utils/ml.utils"
import { fetchProducts } from "./api/products.api.service"
import { fetchSeller } from "./api/users"
import { productScraper } from "./product.scraper.service"
import { productIdsReducer } from "./reducers/product-urls.reducer.service"

const getFullProducts = async ({
  userId,
  productIds,
}: FetchProductsArgument): Promise<ProductApiResponse[]> => {
  const productIdsWIthOutDash = productIds.map((id) => id.replaceAll("-", ""))

  const products = await getProducts(userId, productIdsWIthOutDash)

  const productsWithSeller = await Promise.all(
    products.map(async (p) => {
      const seller = await fetchSeller({
        sellerId: p.seller_id.toString(),
        userId,
      })
      return { ...p, seller }
    })
  )

  const productsWithSellerAndMetadata = await Promise.all(
    productsWithSeller.map(async (product) => {
      const productId = convertCatalogIdToProductId(product.id)

      const [scrapProductPage] = await Promise.all([
        productScraper(convertCatalogIdToProductId(product.id)),
      ])

      const extraFields = _getProductExtraFields({
        product,
        currentPrice: scrapProductPage?.currentPrice,
        quantitySold: scrapProductPage?.quantitySold,
      })

      const ean = _getEanFromProductObj(product)
      extraFields.ean = ean
      extraFields.has_video = scrapProductPage.hasVideo
      extraFields.picture_count = product.pictures.length
      extraFields.supermarket_eligible = product.tags.includes(
        "supermarket_eligible"
      )

      let category = null

      return {
        category,
        productId,
        ...product,
        ...extraFields,
      }
    })
  )

  // Return the final list of products with all the necessary information
  return productsWithSellerAndMetadata
}

const getFullProduct = async ({
  userId,
  productId,
}: FetchProductArgument): Promise<ProductApiResponse> => {
  const products = await getFullProducts({ userId, productIds: [productId] })
  return products[0]
}

const _getEanFromProductObj = (product: MLProduct): string | null => {
  try {
    return product.attributes
      .find((a) => a.id === "GTIN")
      .value_name?.toString()
  } catch (e) {
    return null
  }
}

const _getProductExtraFields = ({
  product,
  currentPrice,
  quantitySold,
}: {
  product: MLProduct
  currentPrice: number
  quantitySold: number
}): MlProductExtraFields & { commissions: MLProductCommission } => {
  quantitySold = quantitySold ?? 1
  const revenue = currentPrice * quantitySold
  const days = calculateDaysFrom(product.date_created)
  const daily_revenue = roundNumber(revenue / days)
  const has_promotion =
    currentPrice < product.price || product.price < product.original_price
  const commissions = calculateCommissions(currentPrice)
  return {
    ...product,
    has_promotion,
    revenue,
    quantity_sold: quantitySold,
    current_price: currentPrice,
    daily_revenue,
    commissions,
  }
}

// const _getProductStatistics = ({
//   product,
//   currentPrice,
//   quantitySold,
// }: {
//   product: MLProduct
//   currentPrice: number
//   quantitySold: number
// }): MLProduct => {
//   const revenue = currentPrice * quantitySold
//   const days = calculateDaysFrom(product.date_created)
//   const ean = getEanIfExist(product.attributes)

//   const daily_revenue = roundNumber(revenue / days)
//   const has_promotion =
//     currentPrice < product.price || product.price < product.original_price
//   const commissions = calculateCommissions(currentPrice)
//   return {
//     ...product,
//     ean,
//     has_promotion,
//     revenue,
//     quantity_sold: quantitySold,
//     current_price: currentPrice,
//     daily_revenue,
//     commissions,
//   }
// }

const getProducts = async (
  userId: string,
  productIds: ProductId[]
): Promise<MLProduct[]> => {
  const productIdMatrix = productIdsReducer(productIds)

  return (
    await Promise.all(
      productIdMatrix.map(async (productIds): Promise<MLProduct[]> => {
        const productIdStrs: string = productIds.join(", ")
        return await fetchProducts(userId, productIdStrs)
      })
    )
  ).flat(1)
}

// const getProductComplete = async ({
//   userId,
//   productId,
// }: FetchProductArgument) => {
//   const productIdWIthDash = convertCatalogIdToProductId(productId)
//   const product = await fetchProduct({ userId, productId })
//   const sellerId = product?.seller_id?.toString()

//   const [user, scrapProductPage] = await Promise.all([
//     fetchSeller({ sellerId, userId }),
//     _webScrapeProductPriceAndQuantitySold(productIdWIthDash),
//   ])
//   const extraFields = _getProductStatistics({
//     product,
//     currentPrice: scrapProductPage.currentPrice,
//     quantitySold: scrapProductPage.quantitySold,
//   })

//   return {
//     ...product,
//     user,
//     ...extraFields,
//   }
// }

const calculateCommissions = (currentPrice: number): MLProductCommission => {
  const fixedCommissionPrice = 0.12
  const fixedShipmentPrice = 22
  const maxPriceWithoutShipmentCommission = 79

  const shipmentCommission =
    currentPrice > maxPriceWithoutShipmentCommission ? fixedShipmentPrice : 0
  const percentageCommission = fixedCommissionPrice * currentPrice
  const totalCommission = shipmentCommission + percentageCommission
  const grossProfit = currentPrice - totalCommission

  const commissions = {
    fixedCommissionPrice,
    fixedShipmentPrice,
    shipmentCommission,
    currentPrice,
    percentageCommission,
    totalCommission,
    grossProfit,
  }

  return commissions
}

const getProductInCorrectOrder = (
  productIds: ProductId[],
  products: MLProduct[]
): MLProduct[] => {
  return productIds.map((productId) => {
    const product = products.find((product) => product.id === productId)
    return product
  })
}

export {
  getProducts,
  getProductInCorrectOrder,
  calculateCommissions,
  getFullProduct,
  getFullProducts,
}
