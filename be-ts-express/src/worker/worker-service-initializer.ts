import { parentPort, workerData } from "worker_threads"
import dataSource from "../db/data-source"
import { WorkerService } from "./services/worker.service"
import { fetchCatalogToDbWorker } from "./workers-functions/fetch-catalogs-to-db.worker"
import { fetchProductsToDbWorker } from "./workers-functions/fetch-products-to-db.worker"

const workerLogicMap: { [key: string]: (data: any) => Promise<any> } = {
  // Define your worker functions here
  // Example:
  fetchProductsToDbWorker,
  fetchCatalogToDbWorker,
}

export async function initializeWorker() {
  const {
    jobServiceType,
    batchSize,
    delay,
    workerFunction: functionKey,
  } = workerData
  console.log("workerData", functionKey)
  await dataSource.initialize()
  console.log("Database connection initialized in worker")

  const workerFunction = workerLogicMap[functionKey]
  if (!workerFunction) {
    throw new Error(`No worker logic found for functionKey: ${functionKey}`)
  }

  console.log("jobServiceType", jobServiceType)
  const workerInstance = new WorkerService(
    jobServiceType,
    batchSize,
    delay,
    workerFunction
  )

  // Listen for stop signal
  parentPort?.on("message", (message) => {
    if (message === "stop") {
      workerInstance.stop()
    }
  })

  // Start the worker
  workerInstance.start()
}
