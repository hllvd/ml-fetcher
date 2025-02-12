import { Jobs } from "../../entities/sql/jobs.entity"
import { JobServiceType } from "../../enums/jobs-service-type.enum"
import { JobsStatus } from "../../enums/jobs-status.enum"
import { JobsService } from "../../services/jobs/jobs.service"

export class WorkerService {
  private isRunning: boolean = true
  private readonly jobService: JobsService
  private retryDelay: number = 5000 // Delay between retries in milliseconds

  constructor(
    private readonly jobServiceType: JobServiceType,
    private readonly batchSize: number,
    private readonly delay: number,
    private readonly workerFunction: <T>(data: any) => Promise<T>
  ) {
    this.jobService = new JobsService()
  }

  public async start() {
    while (this.isRunning) {
      const jobs = this.batchSize
        ? await this.jobService.GetJobs(this.jobServiceType, this.batchSize)
        : await this.jobService.GetJobs(this.jobServiceType, 2)
      console.log("jobs length", jobs.length)
      try {
        if (jobs.length > 0) {
          try {
            const goodJobs = await this.workerFunction<Array<Jobs>>(jobs)
            await this.jobService.UpdateStatus(goodJobs, JobsStatus.Completed)
          } catch (error) {
            // Handle failed jobs
            console.error("Failed to process jobs:", {
              jobIds: jobs.map((job) => job.id),
              error: error.message,
            })
            await this.handleFailedJobs(jobs, error)
          }

          //his.jobService.UpdateStatus(jobs, JobsStatus.Completed)
        }
      } catch (error) {
        console.error(`[WorkerServiceWorker] Error processing jobs:`, error)
        this.jobService.UpdateStatus(jobs, JobsStatus.Failed)
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay))
      } finally {
        await this.sleep(this.delay)
      }
    }
  }

  private async handleFailedJobs(jobs: any[], error: any) {
    console.error("Failed to process jobs:", {
      jobIds: jobs.map((job) => job.id),
      error: error.message,
    })
  }

  public stop() {
    this.isRunning = false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
