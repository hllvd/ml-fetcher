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

  constructor(
    @inject(TYPES.DataSource) private dataSource: DataSource,
    @inject(TYPES.IBrandRepository) private brandsRepository,
    @inject(TYPES.ISellerRepository) private sellerRepository,
    @inject(TYPES.IViewsRepository) private viewsRepository,
    @inject(TYPES.ICatalogFieldsRepository)
    private catalogFieldsRepository,
    @inject(TYPES.IStateFieldsRepository) private stateFieldsRepository
  ) {
    this.productsRepository = this.dataSource.getRepository(ProductsCatalogs)
  }

  async getByIds(productIds: string[]): Promise<ProductsCatalogs[]> {
    const products = await this.productsRepository.findBy({
      id: In(productIds),
    })
    return products
  }

  public async getById(productIds: string[]): Promise<ProductsCatalogs> {
    const productsCatalogs = await this.productsRepository
      .createQueryBuilder("products")
      .leftJoinAndSelect("products.brandModel", "brandModel IS NOT NULL")
      .leftJoinAndSelect("products.seller", "seller IS NOT NULL")
      .leftJoinAndSelect("products.views", "views IS NOT NULL")
      .leftJoinAndSelect(
        "products.catalogFields",
        "catalogFields IS NOT NULL",
        "products.catalogFields IS NOT NULL"
      )
      .leftJoinAndSelect("products.stateFields", "StateFields")
      .where("products.id = :productId", In(productIds))
      .getOne()
    return productsCatalogs
  }

  async upsert(productCatalog: ProductsCatalogs): Promise<ProductsCatalogs>
  async upsert(productCatalogs: ProductsCatalogs[]): Promise<ProductsCatalogs[]>
  async upsert(
    input: ProductsCatalogs | ProductsCatalogs[]
  ): Promise<ProductsCatalogs | ProductsCatalogs[]> {
    const products = Array.isArray(input) ? input : [input]
    Promise.all([
      products.map(async (product) => {
        await this.upsertSingle(product)
      }),
    ])
    return input
  }

  private async upsertSingle(productInfo) {
    try {
      const productRepository = this.productsRepository

      // Create or get existing catalog
      let catalog = await productRepository.findOne({
        where: { id: productInfo.id },
        relations: ["brandModel"],
      })

      if (!catalog) {
        catalog = new ProductsCatalogs()
        catalog.id = productInfo.id
      }

      if (productInfo?.brandModel) {
        const brandModel = await this.brandsRepository.findOrInsert(
          productInfo.brandModel
        )
        catalog.brandModel = brandModel
      }

      if (productInfo?.seller) {
        const seller = await this.sellerRepository.upsert(productInfo.seller)
        catalog.seller = seller
      }

      if (productInfo?.views) {
        console.log("views here")
        await this.viewsRepository.upsert(productInfo.views)
        catalog.views = productInfo?.views
      }
      if (productInfo?.catalogFields) {
        console.log("================>", productInfo.catalogFields)
        await this.catalogFieldsRepository.upsert(productInfo.catalogFields)
        catalog.catalogFields = productInfo.catalogFields
      }

      catalog = productRepository.merge(catalog, {
        ...productInfo,
        title: productInfo.title,
      })

      const result = await this.dataSource.manager.upsert(
        ProductsCatalogs,
        [catalog],
        ["catalogFields"]
      )

      if (!productInfo?.views) {
        await this.viewsRepository.link(productInfo.id)
      }
      if (productInfo?.stateFields) {
        await this.stateFieldsRepository.flushAndInsert(
          productInfo?.stateFields
        )
      }

      return result
    } catch (error) {
      console.error("Error in upsert operation:", error)
      throw error
    }
  }
}
