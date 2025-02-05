import { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"
import { sanitizeAmountSold } from "../../../../../utils/ml.utils"

const webScrapProductMetadata = async (
  response: AxiosResponse
): Promise<{
  response: {
    quantitySold: number
    currentPrice: number
    hasVideo: boolean
  }
}> => {
  const dom = new JSDOM(await response.data)
  const document = dom.window.document

  const amountHtml = document.querySelector(".ui-pdp-subtitle")
  const amountStrInner = amountHtml.textContent
  const quantitySold = sanitizeAmountSold(amountStrInner)

  const priceHtml = document.querySelector("meta[itemprop=price]")
  const priceStr = priceHtml.getAttribute("content")
  const currentPrice = Number.parseFloat(priceStr)

  const clipIconHtml = document.querySelector(
    ".ui-pdp-thumbnail--overlay .clip-picture-icon"
  )

  const hasVideo = !!clipIconHtml

  return { response: { currentPrice, quantitySold, hasVideo } }
}
export { webScrapProductMetadata }
