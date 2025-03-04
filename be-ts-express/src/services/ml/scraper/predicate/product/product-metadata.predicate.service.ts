import { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"
import { PowerSellerStatus } from "../../../../../models/dto/ml-user.models"
import { ProductScrapeOutput } from "../../../../../models/predicate/predicate-response.models"
import { sanitizeAmountSold } from "../../../../../utils/ml.utils"
import {
  queryQuantitySold,
  queryCurrentPrice,
  queryHasVideo,
  queryProductLength,
  queryIsFull,
  queryOfficialStore,
  queryPowerSeller,
  querySellerId,
  queryProductType,
  queryStarsAmount,
  queryStarsRating,
} from "../../queries/products.query"

const webScrapProductMetadata = async (
  response: AxiosResponse
): Promise<{
  response: ProductScrapeOutput
}> => {
  const dom = new JSDOM(await response.data)
  const document = dom.window.document

  const quantitySold = queryQuantitySold(document)
  const starsRating = queryStarsRating(document)
  const starsAmount = queryStarsAmount(document)

  const currentPrice = queryCurrentPrice(document)

  const hasVideo = queryHasVideo(document)

  let catalogProductLength = queryProductLength(document)

  const isFull = queryIsFull(document)
  const officialStore = queryOfficialStore(document)

  const powerSeller = queryPowerSeller(document)

  const sellerId = 3 //querySellerId(document)

  const isProduct = queryProductType(document)

  return {
    response: {
      catalogProductLength,
      currentPrice,
      quantitySold,
      hasVideo,
      isFull,
      officialStore,
      powerSeller,
      starsRating,
      starsAmount,
      sellerId,
      isProduct,
    },
  }
}

export { webScrapProductMetadata }
