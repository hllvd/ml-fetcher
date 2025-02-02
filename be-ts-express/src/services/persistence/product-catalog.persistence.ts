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

import {
  brandModelFieldHandler,
  getBrandModel,
} from "../../repository/brands.repository"

import { StateFields } from "../../entities/sql/state-fields.entity"

import productsCatalogsRepository from "../../repository/products-catalogs.repository"

export const saveProductToDb = async (productInfo: ProductApiResponse) => {
  let product = new ProductsCatalogs()
  product = convertProductApiResponseToProductCatalogEntity(
    productInfo,
    EntityType.Product
  )

  const { brand, model, color } = getBrandModel(productInfo)
  product.brandModel = await brandModelFieldHandler({ brand, model, color })

  const { seller: userInfo } = productInfo
  let seller = new Seller()
  const existingUser = await dataSource.manager
    .getRepository(Seller)
    .findOne({ where: { id: userInfo.id } })

  if (!existingUser) {
    seller = convertMLUserFromApiResponseToSellerEntity(userInfo)
    //await dataSource.manager.getRepository(Seller).save(seller)
  }

  product.seller = existingUser || seller
  //await dataSource.manager.save(product)
  await productsCatalogsRepository.upsert(product)
  console.log("saved saveProductToDb to db")
}

export const saveCatalogToDb = async (catalogInfo: CatalogApiResponse) => {
  console.log("saveCatalogToDb 1")
  try {
    let catalog = new ProductsCatalogs()
    catalog = convertCatalogApiResponseToProductCatalogEntity(
      catalogInfo,
      EntityType.Catalog
    )
    const { brand, model, color } = catalogInfo?.brandModel
    catalog.brandModel = await brandModelFieldHandler({ brand, model, color })

    const catalogFields = new CatalogFields()

    const catalogFieldConverted =
      await catalogInfoToCatalogFieldsEntityConverter({
        catalogInfo,
        catalogFields,
      })
    const catalogStateFieldsConverted = await catalogStateFieldsConverter(
      catalogInfo
    )

    catalog.stateFields =
      catalogStateFieldsConverted as unknown as Array<StateFields> /// TODO
    console.log("catalogFieldConverted", catalogFieldConverted)
    catalog.catalogFields = catalogFieldConverted

    await productsCatalogsRepository.upsert(catalog)
    console.log("save saveCatalogToDb to db")
  } catch (e) {
    console.log("error saveCatalogToDb to db")
  }
}
