import { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"
import { PowerSellerStatus } from "../../../../../models/dto/ml-user.models"
import { sanitizeAmountSold } from "../../../../../utils/ml.utils"

const webScrapeCatalogToMetadataPredicate = async (
  response: AxiosResponse
): Promise<{
  response: {
    productSales: number
    hasVideo: boolean
    catalogProductLength?: number
    officialStore?: boolean
    powerSeller?: PowerSellerStatus
    starsRating?: number
    starsAmount?: number
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
  const starsRating = document.querySelector(".ui-pdp-review__rating")
    ?.textContent
    ? Number.parseFloat(
        document.querySelector(".ui-pdp-review__rating")?.textContent
      )
    : null
  const starsAmount = document.querySelector(".ui-pdp-review__amount")
    ? parseInt(
        document.querySelector(".ui-pdp-review__amount")?.replace(/\D/g, "")
      )
    : null

  let catalogProductLength = null
  const catalogProductLengthText = document.querySelector(
    ".ui-search-search-result__content-columns"
  )?.textContent
  if (catalogProductLengthText)
    catalogProductLength = extractCatalogLength(catalogProductLengthText)

  const hasVideo = !!clipIconHtml
  console.log("hasVideo", hasVideo)

  const officialStore =
    document.querySelector(".ui-pdp-seller__label-sold")?.textContent ===
    "Loja oficial"

  const powerSeller = switchPowerSeller(
    document.querySelector(".ui-seller-data-status__lider-seller > p")
      ?.textContent
  )

  return {
    response: {
      productSales,
      hasVideo,
      catalogProductLength,
      officialStore,
      powerSeller,
      starsRating,
      starsAmount,
    },
  }
}

const switchPowerSeller = (scrappedText: string) => {
  switch (scrappedText) {
    case "MercadoLíder Platinum":
      return PowerSellerStatus.Platinum
    case "MercadoLíder Gold":
      return PowerSellerStatus.Gold
    case "MercadoLíder":
      return PowerSellerStatus.Silver
    default:
      return null
  }
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
