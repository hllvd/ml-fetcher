import { Container } from "inversify"
import { DataSource } from "typeorm"
import AppDataSource from "./config/orm.config"
import { AuthenticationController } from "./controller/authentication.controller"
import { CatalogController } from "./controller/catalog.controller"
import { CategoriesController } from "./controller/categories.controller"
import { ExampleController } from "./controller/example.controller"
import { ProductController } from "./controller/product.controller"
import { SearchController } from "./controller/search.controller"
import { SellerConverter } from "./converters/ml/sellers.converter"
import { IProductApiClient } from "./models/interfaces/products/i-product-api-client.interface"
import { IProductRepository } from "./models/interfaces/products/i-product-repository.interface"
import { IProductService } from "./models/interfaces/products/i-product-service.interface"
import { ISellerApiClient } from "./models/interfaces/sellers/i-seller-api-client.interface"
import { ISellerConverter } from "./models/interfaces/sellers/i-seller-converter.interface"
import { ISellerRepository } from "./models/interfaces/sellers/i-seller-repository.interface"
import { ISellerService } from "./models/interfaces/sellers/i-seller-service.interface"
import ProductRepository from "./repository/products.repository"
import SellerRepository from "./repository/seller.repository"
import { ProductApiClient } from "./services/ml/api/product-api-client.service"
import { SellerApiClient } from "./services/ml/api/seller-api-client.service"
import { ProductService } from "./services/ml/products.service"
import { SellerService } from "./services/ml/seller.service"
import { TYPES } from "./types"

const container = new Container()

container
  .bind<AuthenticationController>(TYPES.AuthenticationController)
  .to(AuthenticationController)
container.bind<ISellerRepository>(TYPES.ISellerRepository).to(SellerRepository)
container.bind<ISellerApiClient>(TYPES.ISellerApiClient).to(SellerApiClient)
container.bind<ISellerConverter>(TYPES.ISellerConverter).to(SellerConverter)
container.bind<ISellerService>(TYPES.ISellerService).to(SellerService)
container
  .bind<IProductRepository>(TYPES.IProductRepository)
  .to(ProductRepository)
container.bind<IProductApiClient>(TYPES.IProductApiClient).to(ProductApiClient)
container
  .bind<IProductService>(TYPES.ProductService)
  .to(ProductService)
  .inSingletonScope()
container.bind<ExampleController>(TYPES.ExampleController).to(ExampleController)
container.bind<CatalogController>(TYPES.CatalogController).to(CatalogController)
container
  .bind<CategoriesController>(TYPES.CategoriesController)
  .to(CategoriesController)
container.bind<ProductController>(TYPES.ProductController).to(ProductController)
container.bind<SearchController>(TYPES.SearchController).to(SearchController)

// Bind the DataSource
container.bind<DataSource>(TYPES.DataSource).toConstantValue(AppDataSource)

export { container }
