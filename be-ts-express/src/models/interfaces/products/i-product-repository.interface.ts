import { IProduct } from "./i-product.interface"

export interface IProductRepository {
  getProductById(productId: string): Promise<IProduct | null>
}
