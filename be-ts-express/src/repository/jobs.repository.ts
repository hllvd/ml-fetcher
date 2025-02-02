import dataSource from "../db/data-source"

import { JobsStatus } from "../enums/jobs-status.enum"
import { JobsPriority } from "../enums/jobs-priority.enum"
import { Jobs } from "../entities/sql/jobs.entity"
import { FindManyOptions, MoreThan } from "typeorm"
import { EntityType } from "../enums/entity-type.enum"

const save = async (jobs: Jobs | Array<Jobs>): Promise<Array<Jobs>> => {
  const jobsArray = Array.isArray(jobs) ? jobs : [jobs]
  try {
    return await dataSource.manager.getRepository(Jobs).save(jobsArray)
  } catch (e) {
    console.log(e)
  }
}

interface JobsRepositoryListParam {
  filter?: {
    productType?: EntityType
    jobStatus?: JobsStatus
    jobPriority?: JobsPriority
  }
  limit?: number
}

const list = async (
  arg: JobsRepositoryListParam = {
    limit: 30,
    filter: {
      jobStatus: JobsStatus.Pending,
      productType: null,
      jobPriority: null,
    },
  }
): Promise<Array<Jobs>> => {
  const { filter = {}, limit } = arg

  const {
    productType = null,
    jobPriority = null,
    jobStatus = JobsStatus.Pending,
  } = filter

  let options: FindManyOptions<Jobs> = {
    where: { ttl: MoreThan(0), jobStatus: 0 },
  }

  if (productType !== null) {
    options = { where: { ...options?.where, product: { type: productType } } }
  }

  if (jobPriority) {
    options = {
      ...options,
      where: { ...options?.where, jobPriority: jobPriority, ttl: MoreThan(0) },
    }
  }

  if (jobStatus) {
    options = { ...options, where: { ...options?.where, jobStatus: jobStatus } }
  }

  const defaultOptions: FindManyOptions<Jobs> = {
    where: {
      jobStatus,
      ttl: MoreThan(0),
    },
    relations: ["product", "jobGroups"],
    order: {
      jobPriority: "DESC",
      metadataCreateAt: "ASC",
    },
    take: limit + 1,
    skip: 0,
  }

  const jobs = await dataSource
    .getRepository(Jobs)
    .find({ ...defaultOptions, ...options })

  return jobs
}

export default { save, list }
