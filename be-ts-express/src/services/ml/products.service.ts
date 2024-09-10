import { ScrapeType } from "../../enums/scrap-type.enum"
import { MLProduct, ProductId } from "../../models/dto/ml-product.models"
import { FetchProductArgument } from "../../models/params/fetch-product.model"
import { calculateDaysFrom } from "../../utils/day-claculation.util"
import { convertCatalogIdToProductId } from "../../utils/ml.utils"
import { fetchProduct, fetchProducts } from "./api/products.api.service"
import { fetchSeller } from "./api/users"
import { productIdsReducer } from "./reducers/product-urls.reducer.service"
import { webScrapeProductPriceAndQuantitySoldPredicate } from "./scraper/predicate/product/product-metadata.predicate.service"
import { webScrapeMlPage } from "./scraper/web.scraper.service"

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

const getProductComplete = async ({
  userId,
  productId,
}: FetchProductArgument) => {
  const productIdWIthDash = convertCatalogIdToProductId(productId)
  const product = await fetchProduct({ userId, productId })
  const sellerId = product?.seller_id?.toString()

  const [user, scrapProductPage] = await Promise.all([
    fetchSeller({ sellerId, userId }),
    _webScrapeProductPriceAndQuantitySold(productIdWIthDash),
  ])
  const extraFields = _getProductStatistics({
    product,
    currentPrice: scrapProductPage.currentPrice,
    quantitySold: scrapProductPage.quantitySold,
  })
  return {
    ...product,
    user,
    ...extraFields,
  }
}

const _getProductStatistics = ({
  product,
  currentPrice,
  quantitySold,
}: {
  product: MLProduct
  currentPrice: number
  quantitySold: number
}): MLProduct & {
  revenue: number
  quantity_sold: number
  daily_revenue: number
} => {
  const revenue = currentPrice * quantitySold
  const days = calculateDaysFrom(product.date_created)
  const daily_revenue = revenue / days
  return {
    ...product,
    revenue,
    quantity_sold: quantitySold,
    daily_revenue,
  }
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

const _webScrapeProductPriceAndQuantitySold = async (
  productId: string
): Promise<any> => {
  const productPrice: Array<{ productIdStr: string; price: number }> =
    await webScrapeMlPage(webScrapeProductPriceAndQuantitySoldPredicate, {
      productId,
      scrapeType: ScrapeType.ProductPage,
    })
  return productPrice
}

export { getProducts, getProductInCorrectOrder, getProductComplete }
