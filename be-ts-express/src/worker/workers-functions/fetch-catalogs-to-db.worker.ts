import { MY_USER_ID } from "../../constants"
import { Jobs } from "../../entities/sql/jobs.entity"

export const fetchCatalogToDbWorker = async <T>(
  data: any[]
): Promise<void | T | Array<T>> => {
  const jobs = data as unknown as Jobs[]
  const jobAndProduct: Array<{ jobId: string; productId: string }> = jobs.map(
    (job) => {
      const productId = job.product.id
      const jobId = job.id
      return { jobId, productId }
    }
  )

  const jobsCompleted: Array<T> = []

  // await Promise.all(
  //   jobAndProduct.map(async ({ jobId, productId: catalogId }) => {
  //     try {
  //       const catalog = await catalogSummary({ userId: MY_USER_ID, catalogId })
  //       await saveCatalogToDb(catalog)
  //       const job = jobs.find((j) => j.id === jobId)
  //       if (job) {
  //         jobsCompleted.push(job as T)
  //       }
  //     } catch (error) {
  //       console.error(
  //         `fetchCatalogToDbWorker error: jobId:${jobId} | catalogId:${catalogId}`,
  //         error
  //       )
  //     }
  //   })
  // )

  return jobsCompleted
}
