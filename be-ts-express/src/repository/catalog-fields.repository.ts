import { inject, injectable } from "inversify"
import { DataSource, Repository } from "typeorm"
import dataSource from "../db/data-source"
import { CatalogFields } from "../entities/sql/catalog-fields.entity"
import { TYPES } from "../types"

@injectable()
export class CatalogFieldsRepository implements ICatalogFieldsRepository {
  private catalogFieldsRepository: Repository<CatalogFields>

  constructor(@inject(TYPES.DataSource) private dataSource: DataSource) {
    this.catalogFieldsRepository = this.dataSource.getRepository(CatalogFields)
  }

  public async upsert(catalogFieldsInfo: CatalogFields) {
    let catalogFields = await this.catalogFieldsRepository.findOne({
      where: { id: catalogFieldsInfo.id },
    })
    if (!catalogFields) catalogFields = new CatalogFields()
    catalogFields = this.catalogFieldsRepository.merge(catalogFields, {
      ...catalogFieldsInfo,
    })
    await dataSource.manager.upsert<CatalogFields>(
      CatalogFields,
      [catalogFields],
      ["id"]
    )
    return catalogFields
  }
}

/** TODO replace it */
export interface ICatalogFieldsRepository {
  upsert(catalogFieldInfo: CatalogFields): Promise<CatalogFields>
}
