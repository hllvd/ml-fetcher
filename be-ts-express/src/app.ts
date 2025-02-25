import express from "express"
import "reflect-metadata"
import cors from "cors"
import { persistentMiddleware } from "./middlewares/persistent.middleware"
import dataSource from "./db/data-source"
import { entityFromDbMiddleware } from "./middlewares/entity-from-db.middleware"
import { InversifyExpressServer } from "inversify-express-utils"
import { container } from "./inversify.config"
import { TYPES } from "./types" // Import your TYPES

const port = process.env.PORT || 3333

async function bootstrap() {
  try {
    // Initialize database FIRST
    console.log("Initializing database connection...")
    await dataSource.initialize()
    console.log("✅ Data source has been initialized.")

    // DON'T bind DataSource here, it's already bound in inversify.config.ts
    // Instead, update the existing binding if needed:
    if (container.isBound(TYPES.DataSource)) {
      container.unbind(TYPES.DataSource)
    }
    container.bind(TYPES.DataSource).toConstantValue(dataSource)

    // Create the base Express app
    const app = express()

    // Create Inversify Express Server
    const server = new InversifyExpressServer(
      container,
      null,
      { rootPath: "/api" },
      app
    )

    // Configure middleware
    server.setConfig((expressApp) => {
      expressApp.use(cors())
      expressApp.use(express.json())
      expressApp.use(express.urlencoded({ extended: true }))
    })

    // Configure error handling
    server.setErrorConfig((expressApp) => {
      expressApp.use((err: any, req: any, res: any, next: any) => {
        console.error(err.stack)
        res.status(500).send("Something went wrong!")
      })
    })

    // Build the app
    const inversifyApp = server.build()

    // Start the server
    inversifyApp.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`)
    })
  } catch (error) {
    console.error("❌ Error during application startup:", error)
    process.exit(1)
  }
}

bootstrap()
