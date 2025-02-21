import { DataSource } from "typeorm/data-source/DataSource"
import { Repository } from "typeorm/repository/Repository"
import { Seller } from "../entities/sql/seller.entity"
import { ISellerRepository } from "../models/interfaces/sellers/i-seller-repository.interface"

export default class SellerRepository implements ISellerRepository {
  private sellerRepository: Repository<Seller>
  private cache: Record<string, Seller> = {}

  constructor(private dataSource: DataSource) {
    this.sellerRepository = this.dataSource.getRepository(Seller)
  }

  async getById(sellerId: number): Promise<Seller | null> {
    if (this.cache[sellerId]) {
      return this.cache[sellerId]
    }

    const seller = await this.sellerRepository.findOneBy({ id: sellerId })

    if (seller) {
      this.cache[sellerId] = seller
    }
    return seller
  }

  async upsert(seller: Seller): Promise<Seller> {
    await this.sellerRepository.manager
      .getRepository(Seller)
      .upsert(seller, ["id"])
    return seller
  }
}
