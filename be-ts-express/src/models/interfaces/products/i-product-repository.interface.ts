import { ProductsCatalogs } from "../../../entities/sql/products-catalogs.entity"

export interface IProductRepository {
  getByIds(productIds: string[]): Promise<ProductsCatalogs[]>
  upsert(productCatalog: ProductsCatalogs): Promise<ProductsCatalogs>
  upsert(productCatalogs: ProductsCatalogs[]): Promise<ProductsCatalogs[]>
}
