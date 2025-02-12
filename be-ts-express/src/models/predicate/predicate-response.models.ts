import { ProductId } from "../dto/ml-product.models"
import { PowerSellerStatus } from "../dto/ml-user.models"

export interface PredicateResponse<T> {
  nextPage?: boolean | string
  response: Array<T>
}
export interface ProductIdStrAndPriceResponse {
  productIdStr: ProductId
  price: number
}

export interface ProductScrapeOutput {
  currentPrice: number
  quantitySold: number
  hasVideo: boolean
  catalogProductLength?: number
  officialStore: boolean
  powerSeller: PowerSellerStatus
  starsRating: number
  starsAmount: number
  isFull: boolean
  sellerId: number
  isProduct: boolean
}
