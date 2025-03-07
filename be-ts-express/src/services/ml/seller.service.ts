import { inject } from "inversify"
import { Seller } from "../../entities/sql/seller.entity"
import { MLProduct } from "../../models/dto/ml-product.models"
import { ISellerApiClient } from "../../models/interfaces/sellers/i-seller-api-client.interface"
import { ISellerConverter } from "../../models/interfaces/sellers/i-seller-converter.interface"
import { ISellerRepository } from "../../models/interfaces/sellers/i-seller-repository.interface"
import { ISellerService } from "../../models/interfaces/sellers/i-seller-service.interface"
import { TYPES } from "../../types"

export class SellerService implements ISellerService {
  constructor(
    @inject(TYPES.ISellerRepository)
    private sellerRepository: ISellerRepository,
    @inject(TYPES.ISellerApiClient) private sellerApiClient: ISellerApiClient,
    @inject(TYPES.ISellerConverter) private sellerConverter: ISellerConverter
  ) {}

  public async getSeller({
    userId,
    sellerId,
  }: {
    userId: string
    sellerId: number
  }): Promise<Seller> {
    const sellerIdNumber = sellerId
    let seller = await this.sellerRepository.getById(sellerIdNumber)

    if (seller == null || seller.nickname == null) {
      const apiResponse = await this.sellerApiClient.fetchSeller({
        userId,
        sellerId: sellerId.toString(),
      })
      seller = this.sellerConverter.convert(apiResponse)
      await this.sellerRepository.upsert(seller)
    }

    return seller
  }

  public populateProductsWithSeller = async ({
    products,
    userId,
  }: {
    products
    userId: string
  }): Promise<MLProduct[]> => {
    console.log("populateProductsWithSeller", [...products])
    const productsWithSellers = await Promise.all(
      [...products].map(async (c): Promise<any> => {
        const sellerId = Number.parseInt(c.seller?.id)
        const user = await this.getSeller({ sellerId, userId })
        return { ...c, user }
      })
    )
    return productsWithSellers
  }
}
