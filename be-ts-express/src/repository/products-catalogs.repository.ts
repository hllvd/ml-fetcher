import { In } from "typeorm/find-options/operator/In"
import dataSource from "../db/data-source"
import { BrandModel } from "../entities/sql/brand-model.entity"
import { CatalogFields } from "../entities/sql/catalog-fields.entity"
import { ProductsCatalogs } from "../entities/sql/products-catalogs.entity"
import { StateFields } from "../entities/sql/state-fields.entity"
import { ProductViewsSummary } from "../entities/sql/views-summary.entity"
import { EntityType } from "../enums/entity-type.enum"
import brandsPersistence from "./brands.repository"
import catalogFieldsRepository from "./catalog-fields.repository"
import SellerRepository from "./seller.repository"
import sellerRepository from "./seller.repository"

import stateFieldRepository from "./state-field.repository"
import viewsRepository from "./views.repository"

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
const list = async (productListQueries?: ProductListQueries): Promise<any> => {
  const { userId, orderBy, limit } = productListQueries
  // const productListDb = await dataSource.manager.getRepository(ProductsCatalogs)
  const productListDb = await dataSource.manager
    .getRepository(ProductsCatalogs)
    .createQueryBuilder("products")

  const productList = await productListDb.getMany()
  return [...productList]
}

const findByIds = async (
  productIds: Array<string>
): Promise<ProductsCatalogs[]> => {
  const products = await dataSource.getRepository(ProductsCatalogs).findBy({
    id: In(productIds),
  })

  return products
}

const get = async (productId): Promise<ProductsCatalogs> => {
  const productsCatalogs = await dataSource.manager
    .getRepository(ProductsCatalogs)
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
    .where("products.id = :productId", { productId })
    .getOne()
  return productsCatalogs
}
const upsert = async (
  catalogInfo: ProductsCatalogs | Array<ProductsCatalogs>
) => {
  try {
    const catalogs = Array.isArray(catalogInfo) ? catalogInfo : [catalogInfo]
    const catalogsResult = catalogs.map((catalog) => {
      return upsertSingle(catalog)
    })
    return catalogsResult
  } catch (error) {
    console.error("Error in product.upsert operation:", error)
    throw error
  }
}

const upsertSingle = async (catalogInfo: ProductsCatalogs) => {
  try {
    const catalogRepository = dataSource.getRepository(ProductsCatalogs)

    // Create or get existing catalog
    let catalog = await catalogRepository.findOne({
      where: { id: catalogInfo.id },
      relations: ["brandModel"],
    })

    if (!catalog) {
      catalog = new ProductsCatalogs()
      catalog.id = catalogInfo.id
    }

    if (catalogInfo?.brandModel) {
      const brandModel = await brandsPersistence.findOrInsert(
        catalogInfo.brandModel
      )
      catalog.brandModel = brandModel
    }

    if (catalogInfo?.seller) {
      const sellerRepository = new SellerRepository(dataSource)
      const seller = await sellerRepository.upsert(catalogInfo.seller)
      catalog.seller = seller
    }

    if (catalogInfo?.views) {
      console.log("views here")
      await viewsRepository.upsert(catalogInfo.views)
      catalog.views = catalogInfo?.views
    }
    if (catalogInfo?.catalogFields) {
      console.log("================>", catalogInfo.catalogFields)
      await catalogFieldsRepository.upsert(catalogInfo.catalogFields)
      catalog.catalogFields = catalogInfo.catalogFields
    }

    catalog = catalogRepository.merge(catalog, {
      ...catalogInfo,
      title: catalogInfo.title,
    })

    const result = await dataSource.manager.upsert(
      ProductsCatalogs,
      [catalog],
      ["catalogFields"]
    )

    if (!catalogInfo?.views) {
      await viewsRepository.link(catalogInfo.id)
    }
    if (catalogInfo?.stateFields) {
      await stateFieldRepository.flushAndInsert(catalogInfo?.stateFields)
    }

    return result
  } catch (error) {
    console.error("Error in upsert operation:", error)
    throw error
  }
}

export default { list, get, upsert, findByIds }
