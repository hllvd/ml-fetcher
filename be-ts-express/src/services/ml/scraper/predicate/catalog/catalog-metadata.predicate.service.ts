import { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"
import { sanitizeAmountSold } from "../../../../../utils/ml.utils"

const webScrapeCatalogToMetadataPredicate = async (
  response: AxiosResponse
): Promise<{
  response: {
    productSales: number
    hasVideo: boolean
    catalogProductLength?: number
  }
}> => {
  const dom = new JSDOM(await response.data)
  const document = dom.window.document
  const amountHtml = document.querySelector(".ui-pdp-subtitle")
  const amountStrInner = amountHtml.textContent
  const productSales = sanitizeAmountSold(amountStrInner)
  const clipIconHtml = document.querySelector(
    ".ui-pdp-thumbnail--overlay .clip-picture-icon"
  )

  let catalogProductLength = null
  const catalogProductLengthText = document.querySelector(
    ".ui-search-search-result__content-columns"
  )?.textContent
  if (catalogProductLengthText)
    catalogProductLength = extractCatalogLength(catalogProductLengthText)

  const hasVideo = !!clipIconHtml
  console.log("hasVideo", hasVideo)
  return { response: { productSales, hasVideo, catalogProductLength } }
}

const extractCatalogLength = (text: string): number | null => {
  const match = text.match(/(\d+)/) // Regular expression to find one or more digits

  if (match) {
    const numberString = match[1] // The first captured group is the number
    const number = parseInt(numberString, 10) // Parse the string to an integer
    return number
  } else {
    return null // Return null if no number is found
  }
}

export { webScrapeCatalogToMetadataPredicate }
