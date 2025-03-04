import { Job } from "aws-sdk/clients/codepipeline"
import { MY_USER_ID } from "../../constants"
import { Jobs } from "../../entities/sql/jobs.entity"
import { EntityType } from "../../enums/entity-type.enum"
import { catalogScraper } from "../../services/ml/catalog-scraper.service"

import { productScraper } from "../../services/ml/product.scraper.service"

export const scrapProductsCatalogsToDb = async <T>(
  data: any[]
): Promise<void | T | Array<T>> => {
  const jobs = data as unknown as Jobs[]
  const jobAndProduct: Array<{
    jobId: string
    productId: string
    type: number
  }> = jobs.map((job) => {
    const productId = job.product.id
    const jobId = job.id
    const type = job.product.type
    return { jobId, productId, type }
  })

  const jobsCompleted: Array<T> = []

  await Promise.all(
    jobAndProduct.map(async ({ jobId, productId, type }) => {
      try {
        if (type === EntityType.Catalog) {
          const { productList, hasVideo, quantitySold, productLength } =
            await catalogScraper(productId, { maxPage: 1 })
          await completeTheJob(jobs, jobId, jobsCompleted)
        } else if (type === EntityType.Product) {
          /** TODO fix scrap result */
          // const { currentPrice, quantitySold, hasVideo } = await productScraper(
          //   productId
          // )
          await completeTheJob(jobs, jobId, jobsCompleted)
        }
      } catch (error) {
        console.error(
          `scrapProductsCatalogsToDb error: jobId:${jobId} | ${
            type === 1 ? "catalogId:" : "productId"
          }:${productId}`,
          error
        )
      }
    })
  )

  return jobsCompleted
}

const saveProductToDb = (job: Job) => {}

const completeTheJob = async <T>(
  jobs: Jobs[],
  jobId: string,
  jobsCompleted
) => {
  const job = jobs.find((j) => j.id === jobId)
  if (job) {
    jobsCompleted.push(job as T)
  }
}
