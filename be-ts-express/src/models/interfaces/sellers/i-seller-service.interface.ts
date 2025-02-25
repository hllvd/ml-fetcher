import { Seller } from "../../../entities/sql/seller.entity"

export interface ISellerService {
  getSeller(sellerId: string): Promise<Seller>
}
