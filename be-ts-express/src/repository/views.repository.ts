import { inject, injectable } from "inversify"
import { DataSource, Repository } from "typeorm"
import dataSource from "../db/data-source"
import { ProductsCatalogs } from "../entities/sql/products-catalogs.entity"
import { ProductViewsSummary } from "../entities/sql/views-summary.entity"
import { TYPES } from "../types"

@injectable()
export class ViewsRepository implements IViewsRepository {
  private readonly viewsRepository: Repository<ProductViewsSummary>

  constructor(@inject(TYPES.DataSource) private dataSource: DataSource) {
    this.viewsRepository = this.dataSource.getRepository(ProductViewsSummary)
  }

  public async upsert(viewsInfo: ProductViewsSummary) {
    const { id } = viewsInfo

    let views = await this.viewsRepository.findOne({
      where: { id: viewsInfo.id },
    })
    if (!views) views = new ProductViewsSummary()
    views = this.viewsRepository.merge(views, {
      ...viewsInfo,
    })
    let result
    try {
      result = await dataSource.manager.upsert(
        ProductViewsSummary,
        [views],
        ["id"]
      )
      console.log("views result", result)
      await dataSource
        .createQueryBuilder()
        .update(ProductsCatalogs)
        .set({ views: views })
        .where("id = :id", { id: id })
        .execute()
    } catch {
      console.log("Product does not exist yet")
    } finally {
      return result
    }
  }

  public async link(productId: string) {
    const viewsRepository = dataSource.getRepository(ProductViewsSummary)
    try {
      let views = await viewsRepository.findOne({
        where: { id: productId },
      })
      await dataSource
        .createQueryBuilder()
        .update(ProductsCatalogs)
        .set({ views: views })
        .where("id = :id", { id: productId })
        .execute()
    } catch {}
  }
}

/** TODO find a better place to place it */
export interface IViewsRepository {
  upsert(viewsInfo: ProductViewsSummary): Promise<any>
  link(productId: string): Promise<any>
}
