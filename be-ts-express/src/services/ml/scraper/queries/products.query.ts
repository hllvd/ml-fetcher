import { PowerSellerStatus } from "../../../../models/dto/ml-user.models"
import { sanitizeAmountSold } from "../../../../utils/ml.utils"

export const queryProductType = (document): boolean => {
  const regex = /^https:\/\/produto\.[^/]+\/MLB-\d+-.*/
  const url = document.querySelector('meta[property="og:url"]')?.content
  return regex.test(url)
}

export const querySellerId = (document): number | null => {
  const href = document.querySelector(
    ".ui-seller-data-footer__container a"
  )?.href
  const url = new URL(href)
  const sellerIdStr = url?.searchParams.get("seller_id")
  if (!sellerIdStr) {
    throw new Error("Seller ID not found")
  }
  const sellerId = Number.parseInt(sellerIdStr)
  return sellerId
}

export const queryProductLength = (document) => {
  let catalogProductLength = null
  const catalogProductLengthText = document.querySelector(
    ".ui-search-search-result__content-columns"
  )?.textContent
  if (catalogProductLengthText)
    catalogProductLength = extractCatalogLength(catalogProductLengthText)
  return catalogProductLength
}

export const extractCatalogLength = (text: string): number | null => {
  const match = text.match(/(\d+)/) // Regular expression to find one or more digits

  if (match) {
    const numberString = match[1] // The first captured group is the number
    const number = parseInt(numberString, 10) // Parse the string to an integer
    return number
  } else {
    return null // Return null if no number is found
  }
}

export const queryQuantitySold = (document) => {
  const amountHtml = document.querySelector(".ui-pdp-subtitle")
  const amountStrInner = amountHtml.textContent
  const quantitySold = sanitizeAmountSold(amountStrInner)
  return quantitySold
}

export const queryCurrentPrice = (document) => {
  const priceHtml = document.querySelector("meta[itemprop=price]")
  const priceStr = priceHtml.getAttribute("content")
  const currentPrice = Number.parseFloat(priceStr)
  return currentPrice
}

export const queryIsFull = (document) => {
  return !!document.querySelector(".ui-pdp-icon.ui-pdp-icon--full")
}

export const queryOfficialStore = (document): boolean => {
  return (
    document.querySelector(".ui-pdp-seller__label-sold")?.textContent ===
    "Loja oficial"
  )
}

export const queryHasVideo = (document) => {
  const clipIconHtml = document.querySelector(
    ".ui-pdp-thumbnail--overlay .clip-picture-icon"
  )
  return !!clipIconHtml
}

export const queryStarsAmount = (document) => {
  const selector = ".ui-pdp-review__amount"
  const starsAmount = document.querySelector(selector)
    ? parseInt(document.querySelector(selector)?.textContent.replace(/\D/g, ""))
    : null
  return starsAmount
}

export const queryStarsRating = (document) => {
  const selector = ".ui-pdp-review__rating"
  const starsRating = document.querySelector(selector)?.textContent
    ? Number.parseFloat(document.querySelector(selector)?.textContent)
    : null
  return starsRating
}

export const queryPowerSeller = (document) => {
  const selector = ".ui-seller-data-status__lider-seller > p"
  const scrappedText = document.querySelector(selector)?.textContent

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
