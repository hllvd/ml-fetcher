import { ProductsCatalogs } from "../../../entities/sql/products-catalogs.entity"
import { ProductId } from "../../api-response/ml/product-response.models"
import { MLProduct, MLProductCommission } from "../../dto/ml-product.models"
import { FetchProductsArgument } from "../../params/fetch-product.model"

export interface IProductService {
  getMlProduct(userId: string, productIds: ProductId[]): Promise<MLProduct[]>
  getFullProducts(args: FetchProductsArgument): Promise<ProductsCatalogs[]>
  calculateCommissions(currentPrice: number): MLProductCommission
}
