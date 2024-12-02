import {
  catalogInfoToCatalogFieldsEntityConverter,
  convertCatalogApiResponseToProductCatalogEntity,
  convertMLUserFromApiResponseToSellerEntity,
  convertProductApiResponseToProductCatalogEntity,
} from "../../converters/ml.convert"
import { catalogStateFieldsConverter } from "../../converters/ml/state-info.converter"
import dataSource from "../../db/data-source"
import { CatalogFields } from "../../entities/sql/catalog-fields.entity"
import { ProductsCatalogs } from "../../entities/sql/products-catalogs.entity"
import { Seller } from "../../entities/sql/seller.entity"
import { EntityType } from "../../enums/entity-type.enum"
import { CatalogApiResponse } from "../../models/api-response/api/catalog-response.models"
import { ProductApiResponse } from "../../models/api-response/api/product-response.models"
import { stateFieldsRepository } from "../../repository/state-fields.repository"
import {
  brandModelFieldHandler,
  getBrandModel,
} from "./services/brands.persistence"

export const saveProductToDb = async (productInfo: ProductApiResponse) => {
  let product = new ProductsCatalogs()
  product = convertProductApiResponseToProductCatalogEntity(
    productInfo,
    EntityType.Product
  )

  const { brand, model, color } = getBrandModel(productInfo)
  product.brandModel = await brandModelFieldHandler({ brand, model, color })

  const { user } = productInfo
  let seller = new Seller()
  const existingUser = await dataSource.manager
    .getRepository(Seller)
    .findOne({ where: { id: user.id } })

  if (!existingUser) {
    seller = convertMLUserFromApiResponseToSellerEntity(user)
    await dataSource.manager.getRepository(Seller).save(seller)
  }

  product.seller = existingUser || seller
  await dataSource.manager.save(product)
  console.log("saved to db")
}

export const saveCatalogToDb = async (catalogInfo: CatalogApiResponse) => {
  let catalog = new ProductsCatalogs()
  catalog = convertCatalogApiResponseToProductCatalogEntity(
    catalogInfo,
    EntityType.Catalog
  )
  const { brand, model, color } = catalogInfo?.brandModel
  catalog.brandModel = await brandModelFieldHandler({ brand, model, color })

  const catalogFields = new CatalogFields()
  const catalogFieldConverted = await catalogInfoToCatalogFieldsEntityConverter(
    {
      catalogInfo,
      catalogFields,
    }
  )
  // catalogFields.length = 60
  // catalogFields.mlOwner = false
  // catalogFields.positionFull = 1
  console.log("catalogFieldConverted", catalogFieldConverted)
  catalog.catalogFields = catalogFieldConverted

  await dataSource.manager.save(catalog)

  // await dataSource.manager.upsert(
  //   ProductsCatalogs,
  //   [catalog],
  //   ["catalogFields"]
  // )

  const catalogFieldsConverted = await catalogStateFieldsConverter(catalogInfo)
  await stateFieldsRepository(catalogFieldsConverted)
}

enum OrderBy {
  Created = "created",
  Views = "views",
  dailyRevenue = "dailyRevenue",
}
interface ProductListQueries {
  userId?: string
  orderBy?: OrderBy
  limit?: number
}
const listProduct = async (
  productListQueries?: ProductListQueries
): Promise<any> => {
  const { userId, orderBy, limit } = productListQueries
  // const productListDb = await dataSource.manager.getRepository(ProductsCatalogs)
  const productListDb = await dataSource.manager
    .getRepository(ProductsCatalogs)
    .createQueryBuilder("products")
    .leftJoinAndSelect("products.brandModel", "brandModel")
    .leftJoinAndSelect("products.seller", "seller")
    .leftJoinAndSelect("products.catalogField", "catalogFields")

  const productList = await productListDb.getMany()
  return [...productList]
}

export default { listProduct }
