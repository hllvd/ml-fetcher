import { MLProduct } from "../../dto/ml-product.models"
import { IProduct } from "./i-product.interface"

export interface IProductApiClient {
  fetchProducts(userId: string, productIdStr: string): Promise<MLProduct[]>
}
