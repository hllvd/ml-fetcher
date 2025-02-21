import { Container } from "inversify"
import { CatalogController } from "./controller/catalog.controller"
import { CategoriesController } from "./controller/categories.controller"
import { ExampleController } from "./controller/example.controller"
import { ProductController } from "./controller/product.controller"
import { SearchController } from "./controller/search.controller"
import { SellerConverter } from "./converters/ml/sellers.converter"
import { ISellerApiClient } from "./models/interfaces/sellers/i-seller-api-client.interface"
import { ISellerConverter } from "./models/interfaces/sellers/i-seller-converter.interface"
import { ISellerRepository } from "./models/interfaces/sellers/i-seller-repository.interface"
import SellerRepository from "./repository/seller.repository"
import { SellerApiClient } from "./services/ml/seller-fetcher.service"

const container = new Container()

container.bind<ISellerRepository>("ISellerRepository").to(SellerRepository)
container.bind<ISellerApiClient>("ISellerApiClient").to(SellerApiClient)
container.bind<ISellerConverter>("ISellerConverter").to(SellerConverter)
container.bind<ExampleController>("ExampleController").to(ExampleController)
container.bind<CatalogController>("CatalogController").to(CatalogController)
container
  .bind<CategoriesController>("CategoriesController")
  .to(CategoriesController)
container.bind<ProductController>("ProductController").to(ProductController)
container.bind<SearchController>("SearchController").to(SearchController)

export { container }
