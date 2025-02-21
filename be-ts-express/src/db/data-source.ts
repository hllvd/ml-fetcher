import { DataSource } from "typeorm"
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions"
import { MYSQL_PASSWORD } from "../constants"

let connectionOptions: DataSourceOptions = {
  type: "mysql" as "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: MYSQL_PASSWORD,
  database: "ml",
  synchronize: false,
  logging: false,
  entities: ["dist/entities/sql/*.entity{.ts,.js}"],
  migrations: ["dist/db/migrations/*{.ts,.js}"],
}

export default new DataSource({
  ...connectionOptions,
})
