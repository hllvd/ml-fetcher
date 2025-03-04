import { inject, injectable } from "inversify"
import { DataSource } from "typeorm"
import { ProductsCatalogs } from "../entities/sql/products-catalogs.entity"
import { StateFields } from "../entities/sql/state-fields.entity"
import { StateFieldsRepositoryArguments } from "../models/params/state-fields-repository.model"
import { TYPES } from "../types"

@injectable()
export class StateFieldsRepository implements IStateFieldsRepository {
  constructor(@inject(TYPES.DataSource) private dataSource: DataSource) {}
  /**
   * type: StateFieldType
   * productsCatalogsId: string
   * productsCatalogsType: EntityType
   * state: string
   * value: number
   */
  public async upsert(
    arg: StateFieldsRepositoryArguments | Array<StateFieldsRepositoryArguments>
  ) {
    const argArray = Array.isArray(arg) ? arg : [arg]
    const productCatalogCollection =
      this.createProductsCatalogCollectionAndRemoveDuplicates(argArray)

    await this.dataSource.manager.upsert(
      ProductsCatalogs,
      productCatalogCollection,
      ["id"]
    )

    const stateFieldCollection = this.createStateFieldsCollection(argArray)
    await this.dataSource.manager.upsert(StateFields, stateFieldCollection, [
      "state",
      "subType",
      "productCatalog",
    ])
  }

  public async flushAndInsert(stateFieldInfo: StateFields[]) {
    await this.dataSource.manager.delete(StateFields, {
      productCatalog: stateFieldInfo[0].productCatalog,
    })

    await this.dataSource.manager.upsert(StateFields, stateFieldInfo, [
      "state",
      "subType",
      "productCatalog",
    ])
  }

  private createProductsCatalogCollectionAndRemoveDuplicates(
    argArray: Array<StateFieldsRepositoryArguments>
  ): Array<ProductsCatalogs> {
    const uniqueCatalogsMap = new Map<string, ProductsCatalogs>()
    argArray.forEach((arg) => {
      const { productCatalog } = arg
      if (!uniqueCatalogsMap.has(productCatalog)) {
        const productsCatalogs = new ProductsCatalogs()
        productsCatalogs.id = productCatalog
        uniqueCatalogsMap.set(productCatalog, productsCatalogs)
      }
    })

    return Array.from(uniqueCatalogsMap.values())
  }

  private createStateFieldsCollection(
    argArray: Array<StateFieldsRepositoryArguments>
  ): Array<StateFields> {
    const stateFieldsArray = argArray.map((arg) => {
      const { type, subType, state, value, productCatalog } = arg
      const stateFields = new StateFields()
      stateFields.type = type
      stateFields.subType = subType
      stateFields.state = state
      stateFields.value = value
      stateFields.productCatalog = productCatalog
      return stateFields
    })
    return stateFieldsArray
  }
}

/** TODO : replace this interface */
export interface IStateFieldsRepository {
  upsert(
    arg: StateFieldsRepositoryArguments | Array<StateFieldsRepositoryArguments>
  ): Promise<void>
  flushAndInsert(stateFieldInfo: StateFields[]): Promise<void>
}
