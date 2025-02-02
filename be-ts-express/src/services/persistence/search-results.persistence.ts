import { Jobs } from "../../entities/sql/jobs.entity"
import { ProductsCatalogs } from "../../entities/sql/products-catalogs.entity"
import { SearchPosition } from "../../entities/sql/search-positions.entity"
import { Search } from "../../entities/sql/search.entity"
import { EntityType } from "../../enums/entity-type.enum"
import {
  SearchResultApiResponse,
  SearchResultItems,
} from "../../models/api-response/api/search-results-response.models"
import jobGroupsRepository from "../../repository/job-groups.repository"
import jobsRepository from "../../repository/jobs.repository"
import productsCatalogsRepository from "../../repository/products-catalogs.repository"
import searchPositionRepository from "../../repository/search-position.repository"
import searchRepository from "../../repository/search.repository"
import { truncateString } from "../../utils/str.util"

const saveSearchResultToDb = async (
  searchResultsInfo: SearchResultApiResponse
) => {
  console.log("saveSearchResultToDb")
  const {
    searchTerm = null,
    items = null,
    url = null,
  }: {
    searchTerm: string
    items: Array<SearchResultItems>
    url: string
  } = searchResultsInfo

  // Map and save ProductsCatalogs
  const productsCatalogs = items.map(
    ({ id, isProduct, price: currentPrice }: SearchResultItems) => {
      const r = {
        id,
        type: !!isProduct,
        currentPrice,
      } as unknown as ProductsCatalogs
      return r
    }
  )

  await productsCatalogsRepository.upsert(productsCatalogs)
  console.log("saved products from search")
  // Save Search
  const search = new Search()
  search.searchTerm = searchTerm
  search.url = url
  await searchRepository.upsert(search)
  const searchRecord = await searchRepository.get(search.searchTerm)
  console.log("saved search")

  // Map and save SearchPosition
  const searchPosition = items.map(({ id, isProduct, index }) => {
    const pc = new ProductsCatalogs()
    pc.id = id
    pc.type = isProduct ? EntityType.Product : EntityType.Catalog
    const sp = new SearchPosition()
    sp.position = index
    sp.product = pc
    sp.search = searchRecord
    const r = sp as unknown as SearchPosition
    return r
  })

  await searchPositionRepository.del(searchRecord)
  await searchPositionRepository.save(searchPosition)

  // Save Jobs
  const limitedSearchTerm = truncateString(searchTerm, 150)
  const jobGroups = await jobGroupsRepository.create(
    `Products from Search Result: ${limitedSearchTerm}`
  )

  const productIds = productsCatalogs.map((p) => p.id)
  const products = await productsCatalogsRepository.findByIds(productIds)

  const jobs: Array<Jobs> = products.map((pc: ProductsCatalogs): Jobs => {
    const jobs = new Jobs()
    jobs.jobGroups = jobGroups
    jobs.product = pc
    return jobs
  })

  await jobsRepository.save(jobs)
  console.log("saved jobs")
}

export { saveSearchResultToDb }
