import { inject, injectable } from "inversify"
import { In } from "typeorm"
import { DataSource } from "typeorm/data-source/DataSource"
import { Repository } from "typeorm/repository/Repository"
import { ProductsCatalogs } from "../entities/sql/products-catalogs.entity"
import { IProductRepository } from "../models/interfaces/products/i-product-repository.interface"
import { TYPES } from "../types"

@injectable()
export default class ProductRepository implements IProductRepository {
  private productsRepository: Repository<ProductsCatalogs>
  private cache: Record<string, ProductsCatalogs> = {}

  constructor(@inject(TYPES.DataSource) private dataSource: DataSource) {
    this.productsRepository = this.dataSource.getRepository(ProductsCatalogs)
  }

  async getByIds(productIds: string[]): Promise<ProductsCatalogs[]> {
    const product = await this.dataSource
      .getRepository(ProductsCatalogs)
      .findOneBy({
        id: "MLB192738127",
      })

    // First check cache for all products
    const products = await this.productsRepository.findBy({
      id: In(productIds),
    })
    return products
  }

  async upsert(productCatalog: ProductsCatalogs): Promise<ProductsCatalogs>
  async upsert(productCatalogs: ProductsCatalogs[]): Promise<ProductsCatalogs[]>
  async upsert(
    input: ProductsCatalogs | ProductsCatalogs[]
  ): Promise<ProductsCatalogs | ProductsCatalogs[]> {
    if (Array.isArray(input)) {
      await this.productsRepository.upsert(input, ["id"])
      return input
    } else {
      await this.productsRepository.upsert(input, ["id"])
      return input
    }
  }
}
