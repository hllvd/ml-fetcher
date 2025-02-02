import { Worker } from "worker_threads"
import { resolve } from "path"

export class WorkerManagerService {
  private workers: Map<string, Worker> = new Map()
  private workerConfigs: Map<string, any> = new Map()
  private restartDelay: number = 3000 // 3 seconds delay before restart
  private stopOnFail: boolean = false
  public startWorker({
    id,
    jobServiceType,
    batchSize,
    delay,
    workerFunction,
    stopOnFail = false,
  }: {
    id: string
    jobServiceType: number
    batchSize: number
    delay: number
    workerFunction: string
    stopOnFail?: boolean
  }) {
    this.stopOnFail = stopOnFail
    if (this.workers.has(id)) {
      throw new Error(`Worker with ID "${id}" is already running.`)
    }

    // Store worker configuration for restart purposes
    const workerConfig = {
      id,
      jobServiceType,
      batchSize,
      delay,
      workerFunction,
    }
    this.workerConfigs.set(id, workerConfig)

    this.createWorker(workerConfig)
  }

  private createWorker(config: {
    id: string
    jobServiceType: number
    batchSize: number
    delay: number
    workerFunction: string
  }) {
    const { id, jobServiceType, batchSize, delay, workerFunction } = config

    const worker = new Worker(resolve(__dirname, "./../worker-entry.js"), {
      workerData: { jobServiceType, batchSize, delay, workerFunction },
    })

    worker.on("message", (message) => {
      if (message === "stopped") {
        console.log(`Worker ${id} has stopped.`)
      } else if (message.type === "error") {
        // Log the error but don't stop the worker
        console.error(`Worker ${id} execution error:`, message.error)
        if (this.stopOnFail == false) this.restartWorker(id)
      }
    })

    worker.on("error", (error) => {
      console.error(`Worker ${id} encountered an error:`, error)
      // Don't terminate, just restart
      this.restartWorker(id)
    })

    worker.on("exit", (code) => {
      console.log(`Worker ${id} exited with code ${code}.`)
      this.workers.delete(id)

      // Restart the worker if it wasn't intentionally stopped
      if (code !== 0) {
        this.restartWorker(id)
      }
    })

    this.workers.set(id, worker)
    console.log(`Worker ${id} started.`)
  }

  private async restartWorker(id: string) {
    const config = this.workerConfigs.get(id)
    if (!config) return

    const worker = this.workers.get(id)
    if (worker) {
      this.stopWorker(id)
    }

    console.log(`Restarting worker ${id} in ${this.restartDelay}ms...`)

    // Wait for the specified delay before restarting
    await new Promise((resolve) => setTimeout(resolve, this.restartDelay))

    try {
      this.createWorker(config)
      console.log(`Worker ${id} has been restarted`)
    } catch (error) {
      console.error(`Failed to restart worker ${id}:`, error)
    }
  }

  public stopWorker(id: string) {
    const worker = this.workers.get(id)
    if (worker) {
      worker.postMessage("stop")
      this.workers.delete(id)
      this.workerConfigs.delete(id) // Remove config so it won't restart
    } else {
      console.warn(`Worker with ID "${id}" not found.`)
    }
  }

  public stopAllWorkers() {
    this.workers.forEach((worker, id) => {
      worker.postMessage("stop")
      this.workers.delete(id)
      this.workerConfigs.delete(id)
    })
    console.log("All workers have been stopped.")
  }

  public getWorkerIds(): string[] {
    return Array.from(this.workers.keys())
  }
}
