import { Seller } from "../../../entities/sql/seller.entity"

export interface ISellerRepository {
  getById(id: number): Promise<Seller | null>
  upsert(seller: Seller): Promise<Seller>
}
