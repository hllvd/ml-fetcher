import { NextFunction, Response } from "express"
import { MY_USER_ID } from "../../constants"
import { catalogInfoToCatalogFieldsEntityConverter } from "../../converters/ml.convert"
import dataSource from "../../db/data-source"
import { BrandModel } from "../../entities/sql/brand-model.entity"
import { CatalogFields } from "../../entities/sql/catalog-fields.entity"
import { JobGroups } from "../../entities/sql/job-groups.entity"

import { Jobs } from "../../entities/sql/jobs.entity"
import { ProductsCatalogs } from "../../entities/sql/products-catalogs.entity"
import { SearchPosition } from "../../entities/sql/search-positions.entity"
import { Search } from "../../entities/sql/search.entity"
import { Seller } from "../../entities/sql/seller.entity"
import { StateFields } from "../../entities/sql/state-fields.entity"
import { ProductViewsSummary } from "../../entities/sql/views-summary.entity"
import { EntityType } from "../../enums/entity-type.enum"
import { JobServiceType } from "../../enums/jobs-service-type.enum"
import { JobsStatus } from "../../enums/jobs-status.enum"
import { JobsType } from "../../enums/jobs-type.enum"
import {
  StateFieldSubType,
  StateFieldType,
} from "../../enums/state-field-type.enum"
import { RequestExtended } from "../../models/extends/params/request-custom.model"
import jobGroupsRepository from "../../repository/job-groups.repository"
import jobsRepository from "../../repository/jobs.repository"
import productsCatalogsRepository from "../../repository/products-catalogs.repository"
import searchRepository from "../../repository/search.repository"
import { JobsService } from "../../services/jobs/jobs.service"

// const items = async (
//   req: RequestExtended,
//   res: Response,
//   next: NextFunction
// ) => {
//   const jobsService = new JobsService()
//   const productIds = ["MLB3872656679", "MLB3324266469", "MLB332426646444"]
//   const products = await getFullProducts({ userId: MY_USER_ID, productIds })
//   res.status(200).json({ message: "items", ...products })
// }

// const items_getFullproducts = async (
//   req: RequestExtended,
//   res: Response,
//   next: NextFunction
// ) => {
//   const products = await getFullProducts({
//     userId: "1231084821",
//     productIds: ["MLB3828379003"],
//   })

//   const product = await getFullProduct({
//     userId: "1231084821",
//     productId: "MLB3828379003",
//   })

//   res.status(200).json({ ...product, message: "items" })
// }
const items_jobService = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  const jobsService = new JobsService()
  const jobs = await jobsService.GetJobs()
  const jobToUpdate = jobs.slice(0, 1)
  await jobsService.UpdateStatus(jobToUpdate, JobsStatus.Completed)

  res.status(200).json([...jobs])
}
const items_jobs_list = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  const jobs = await jobsRepository.list({
    limit: 500,
  })
  res.status(200).json([...jobs])
}
const items_jobs_create = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  const jobGroups = await jobGroupsRepository.create("desc 2")

  const product1 = new ProductsCatalogs()
  product1.type = 0
  product1.id = "MLB2760464533"
  await productsCatalogsRepository.upsert(product1)
  const product = await dataSource
    .getRepository(ProductsCatalogs)
    .findOne({ where: { id: "MLB2760464533" } })

  const job1 = new Jobs()
  job1.product = product
  job1.jobGroups = jobGroups
  await dataSource.manager.getRepository(Jobs).save(job1)

  // await jobsRepository.save(job1)
  // await jobsRepository.save(job1)

  res.status(200).json({})
}

const job = async () => {}

const items_product_catalogs = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  // const productId = req.query?.productId?.toString()
  // const userId = req.query?.userId?.toString() ?? "1231084821"
  // const productListFromDb = await productsCatalogsRepository.get(productId)
  const prod1 = new ProductsCatalogs()
  prod1.type = 0
  prod1.id = "MLB2760464532"

  const prod2 = new ProductsCatalogs()
  prod2.type = 1
  prod2.id = "MLB19722322"

  const search = new Search()
  search.id = 1
  search.searchTerm = "term"
  search.url = "url"
  await searchRepository.upsert(search)
  const searchRecord = await searchRepository.get(search.searchTerm)

  const searchResult = new SearchPosition()
  searchResult.position = 1
  searchResult.product = prod1
  searchResult.search = searchRecord

  const searchResult2 = new SearchPosition()
  searchResult2.position = 2
  searchResult2.product = prod2
  searchResult2.search = searchRecord

  await dataSource.manager
    .getRepository(SearchPosition)
    .save([searchResult, searchResult2])

  res.status(200).json({ ...searchRecord })
}

const items_ = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  const productId = req.query?.productId?.toString()
  //const userId = req.query?.userId?.toString() ?? "1231084821"
  //const productListFromDb = await persistencyService.listProduct({ userId })
  //res.status(200).json({ ...productListFromDb })
  let catalog = new ProductsCatalogs()
  catalog.type = EntityType.Catalog
  catalog.id = productId
  catalog.title = "title2frtert"

  const catalogFields = new CatalogFields()
  catalogFields.priceBest = 222
  catalogFields.id = catalog.id
  catalogFields.length = 1000
  catalog.catalogFields = { ...catalogFields }

  const seller = new Seller()
  seller.id = 6777
  seller.nickname = "nickname 6777"
  catalog.seller = seller

  const brand = new BrandModel()
  brand.color = "RED"
  brand.model = "model 7"
  brand.brand = "brand 7"
  catalog.brandModel = brand

  const summaryViews = new ProductViewsSummary()
  summaryViews.cv = 1101
  summaryViews.dailyAvg = 150
  summaryViews.id = catalog.id
  summaryViews.totalVisits = 123
  summaryViews.startDate = "2024-02-02"
  summaryViews.endDate = "2024-02-02"
  catalog.views = { ...summaryViews }

  const stateFields = new StateFields()
  stateFields.type = StateFieldType.Medal
  stateFields.subType = StateFieldSubType.Coleta
  stateFields.state = "ttt"
  stateFields.value = 111
  stateFields.productCatalog = catalog.id

  const stateFields2 = new StateFields()
  stateFields2.type = StateFieldType.Medal
  stateFields2.subType = StateFieldSubType.Coleta
  stateFields2.state = "yyy"
  stateFields2.value = 222
  stateFields2.productCatalog = catalog.id

  catalog.stateFields = [stateFields, stateFields2]
  await upsertStateFields([stateFields, stateFields2])

  //await upsertProductCatalog(catalog, EntityType.Catalog)
  res.status(200).json({ ...catalog })
}

const upsertStateFields = async (stateFieldInfo: StateFields[]) => {
  await dataSource.manager.upsert(StateFields, stateFieldInfo, [
    "state",
    "subType",
    "productCatalog",
  ])
  const stateFieldsRepository = dataSource.getRepository(StateFields)
  let views = await stateFieldsRepository.find({
    where: { productCatalog: stateFieldInfo[0].productCatalog },
  })
  console.log("views", views)
  return views
}

const upsertCatalogFields = async (catalogFieldsInfo: CatalogFields) => {
  const catalogFieldsRepository = dataSource.getRepository(CatalogFields)
  let catalogFields = await catalogFieldsRepository.findOne({
    where: { id: catalogFieldsInfo.id },
  })
  if (!catalogFields) catalogFields = new CatalogFields()
  catalogFields = catalogFieldsRepository.merge(catalogFields, {
    ...catalogFieldsInfo,
  })
  return await dataSource.manager.upsert(CatalogFields, [catalogFields], ["id"])
}

const upsertProductViews = async (viewsInfo: ProductViewsSummary) => {
  const viewsRepository = dataSource.getRepository(ProductViewsSummary)
  let views = await viewsRepository.findOne({
    where: { id: viewsInfo.id },
  })
  if (!views) views = new ProductViewsSummary()
  views = viewsRepository.merge(views, {
    ...viewsInfo,
  })
  return await dataSource.manager.upsert(ProductViewsSummary, [views], ["id"])
}

// export const saveCatalogViewsDb = async (
//   viewInfo: CatalogVisitsApiResponse
// ) => {
//   const view = catalogViewsResponseToViewsEntity(viewInfo)
//   try {
//     await dataSource.manager.upsert(ProductViewsSummary, [view], ["id"])
//   } catch (e) {
//     console.log("err")
//     if (e.code === "ER_NO_REFERENCED_ROW_2" || e.code === "ER_DUP_ENTRY") {
//       const { catalogId } = viewInfo
//       await _createProductCatalogRegister({
//         catalogId,
//         type: EntityType.Catalog,
//       })
//       await dataSource.manager.upsert(
//         ProductViewsSummary,
//         [view],
//         ["productsCatalogs"]
//       )
//     }
//   }
// }

const upsertProductCatalog = async (
  catalogInfo: ProductsCatalogs,
  type: EntityType,
  {
    catalogFields,
    brandModel,
    views,
    stateFields,
  }: {
    catalogFields?: CatalogFields
    brandModel?: BrandModel
    views?: ProductViewsSummary
    stateFields?: StateFields
  } = {}
) => {
  try {
    const catalogRepository = dataSource.getRepository(ProductsCatalogs)

    // Create or get existing catalog
    let catalog = await catalogRepository.findOne({
      where: { id: catalogInfo.id },
      relations: ["catalogFields", "brandModel"],
    })

    if (!catalog) {
      catalog = new ProductsCatalogs()
      catalog.id = catalogInfo.id
    }

    if (catalogInfo?.brandModel) {
      const brandModel = await findOrInsertBrandModel(catalogInfo.brandModel)
      catalog.brandModel = brandModel
    }

    if (catalogInfo?.seller) {
      const seller = await upsertSeller(catalogInfo.seller)
      catalog.seller = seller
    }

    if (catalogInfo?.views) {
      const views = await upsertProductViews(catalogInfo.views)
      //catalog.views = views
    }

    if (catalogInfo?.catalogFields) {
      const views = await upsertCatalogFields(catalogInfo.catalogFields)
      catalog.catalogFields = catalogFields
    }

    catalog = catalogRepository.merge(catalog, {
      ...catalogInfo,
      type,
      title: catalogInfo.title,
      // catalogFields,
      // views,
      // stateFields,
    })

    // Save will perform insert or update as needed
    //const result = await catalogRepository.save(catalog)
    const result = await dataSource.manager.upsert(
      ProductsCatalogs,
      [catalog],
      ["catalogFields"]
    )
    return {}
  } catch (error) {
    console.error("Error in upsert operation:", error)
    throw error
  }
}

export const findOrInsertBrandModel = async ({
  brand,
  model,
  color,
}: BrandModel): Promise<BrandModel> => {
  const existingBrandModel = await dataSource.manager
    .getRepository(BrandModel)
    .findOne({ where: { brand, model, color } })

  if (existingBrandModel) {
    return existingBrandModel
  }

  const newBrandModel = new BrandModel()
  newBrandModel.brand = brand
  newBrandModel.model = model
  newBrandModel.color = color
  return await dataSource.manager.getRepository(BrandModel).save(newBrandModel)
}

export const upsertSeller = async (seller: Seller): Promise<Seller> => {
  return await dataSource.manager.getRepository(Seller).save(seller)
}
