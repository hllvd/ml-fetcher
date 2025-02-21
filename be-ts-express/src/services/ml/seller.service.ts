import { Seller } from "../../entities/sql/seller.entity"
import { MLProduct } from "../../models/dto/ml-product.models"
import { ISellerApiClient } from "../../models/interfaces/sellers/i-seller-api-client.interface"
import { ISellerConverter } from "../../models/interfaces/sellers/i-seller-converter.interface"
import { ISellerRepository } from "../../models/interfaces/sellers/i-seller-repository.interface"
import { fetchSeller } from "./api/users"

export class SellerService {
  constructor(
    private sellerRepository: ISellerRepository,
    private sellerApiClient: ISellerApiClient,
    private sellerConverter: ISellerConverter
  ) {}

  async getSeller(sellerId: string): Promise<Seller> {
    let seller = await this.sellerRepository.getSellerById(sellerId)

    if (!seller) {
      const apiResponse = await this.sellerApiClient.fetchSeller(sellerId)
      seller = this.sellerConverter.convert(apiResponse)
      await this.sellerRepository.upsert(seller)
    }

    return seller
  }
}

const getProductSellers = async ({
  products,
  userId,
}: {
  products: Array<MLProduct>
  userId: string
}): Promise<MLProduct[]> => {
  const productsWithSellers = await Promise.all(
    products.map(async (c): Promise<any> => {
      const user = await _getSeller({
        userId,
        sellerId: c.seller_id.toString(),
      })
      return { ...c, user }
    })
  )
  return productsWithSellers
}

const _getSeller = async ({
  userId,
  sellerId,
}: {
  userId: string
  sellerId: string
}) => await fetchSeller({ userId, sellerId })

export { getProductSellers }
