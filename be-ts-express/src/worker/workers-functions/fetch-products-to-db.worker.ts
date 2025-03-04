import { MY_USER_ID } from "../../constants"
import { Jobs } from "../../entities/sql/jobs.entity"

export const fetchProductsToDbWorker = async <T>(
  data: any[]
): Promise<void | T | Array<T>> => {
  const jobs = data as unknown as Jobs[]

  const productIds = jobs.map((d) => d.product).map((p) => p.id)

  const jobsCompleted: Array<T> = []

  // try {
  //   const products = await getFullProducts({ userId: MY_USER_ID, productIds })
  //   Promise.all(
  //     products.map(async (product) => {
  //       await saveProductToDb(product)
  //       const job = jobs.find((j) => j.product.id === product.id)
  //       jobsCompleted.push(job as unknown as T)
  //     })
  //   )
  // } catch (e) {
  //   console.error(`fetchProductsToDbWorker error`)
  // }

  return jobsCompleted
}
