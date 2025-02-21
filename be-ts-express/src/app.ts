import express from "express"

import "reflect-metadata"
import cors from "cors"
import { persistentMiddleware } from "./middlewares/persistent.middleware"
import dataSource from "./db/data-source"
import { entityFromDbMiddleware } from "./middlewares/entity-from-db.middleware"
import { InversifyExpressServer } from "inversify-express-utils"
import { container } from "./inversify.config" // Import your Inversify container

const port = process.env.PORT || 3333

// 1. Create the base Express app
const app = express()

// 2. Create Inversify Express Server with the container and existing app
const server = new InversifyExpressServer(
  container,
  null,
  { rootPath: "/api" }, // Optional root path
  app // Pass the existing Express app instance
)

// 3. Configure middleware using Inversify's setConfig
server.setConfig((expressApp) => {
  // Add your existing middleware
  expressApp.use(cors())
  expressApp.use(express.json())
  expressApp.use(express.urlencoded({ extended: true }))

  // Add your existing routes

  // Add other middlewares (uncomment if needed)
  // expressApp.use(persistentMiddleware);
  // expressApp.use(entityFromDbMiddleware);
})

// 4. Configure error handling (optional)
server.setErrorConfig((expressApp) => {
  expressApp.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack)
    res.status(500).send("Something went wrong!")
  })
})

// 5. Build the final app with Inversify and Express configurations
const inversifyApp = server.build()

// 6. Start the server with database initialization
inversifyApp.listen(port, async () => {
  try {
    await dataSource.initialize()
    console.log("Data source has been initialized.")
    console.log(`Server is running on port ${port}`)
  } catch (error) {
    console.error("Error during data source initialization:", error)
  }
})
