import { ProductsCatalogs } from "../../../entities/sql/products-catalogs.entity"
import { Seller } from "../../../entities/sql/seller.entity"
import { MLProduct } from "../../dto/ml-product.models"

export interface ISellerService {
  getSeller({
    userId,
    sellerId,
  }: {
    userId: string
    sellerId: number
  }): Promise<Seller>
  populateProductsWithSeller({
    products,
    userId,
  }: {
    products: Array<ProductsCatalogs>
    userId: string
  }): Promise<Array<MLProduct>>
}
