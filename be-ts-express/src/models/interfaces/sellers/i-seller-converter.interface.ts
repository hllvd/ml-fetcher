import { Seller } from "../../../entities/sql/seller.entity"

export interface ISellerConverter {
  convert(response: any): Seller
}
