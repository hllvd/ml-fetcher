import { inject, injectable } from "inversify"
import { TYPE } from "inversify-express-utils/lib/constants"
import { convertProductApiResponseToProductCatalogEntity } from "../../converters/ml.convert"
import { ProductsCatalogs } from "../../entities/sql/products-catalogs.entity"
import { EntityType } from "../../enums/entity-type.enum"
import { MlProductExtraFields } from "../../models/dto/ml-product-extra-fields.models"
import {
  MLProduct,
  MLProductCommission,
  ProductId,
} from "../../models/dto/ml-product.models"
import { MLUser } from "../../models/dto/ml-user.models"
import { IProductApiClient } from "../../models/interfaces/products/i-product-api-client.interface"
import { IProductRepository } from "../../models/interfaces/products/i-product-repository.interface"
import { IProductService } from "../../models/interfaces/products/i-product-service.interface"
import { FetchProductsArgument } from "../../models/params/fetch-product.model"
import { TYPES } from "../../types"
import { calculateDaysFrom } from "../../utils/day-calculation.util"
import { roundNumber } from "../../utils/math.util"
import {
  convertCatalogIdToProductId,
  getAttributeValueName,
} from "../../utils/ml.utils"
import { productScraper } from "./product.scraper.service"
import { productIdsReducer } from "./reducers/product-urls.reducer.service"
import { SellerService } from "./seller.service"

@injectable()
export class ProductService implements IProductService {
  constructor(
    @inject(TYPES.IProductRepository)
    private productRepository: IProductRepository,
    @inject(TYPES.IProductApiClient)
    private productApiClient: IProductApiClient,
    @inject(TYPES.ISellerService) private sellerService: SellerService
  ) {}

  public async getMlProduct(
    userId: string,
    productIds: ProductId[]
  ): Promise<MLProduct[]> {
    const productIdMatrix = productIdsReducer(productIds)
    return (
      await Promise.all(
        productIdMatrix.map(async (productIds): Promise<MLProduct[]> => {
          const productIdsStr: string = productIds.join(", ")
          return await this.productApiClient.fetchProducts(
            userId,
            productIdsStr
          )
        })
      )
    ).flat(1)
  }

  public async getFullProducts({
    userId,
    productIds,
  }: FetchProductsArgument): Promise<ProductsCatalogs[]> {
    const productIdsWithoutDash = productIds.map((id) => id.replaceAll("-", ""))

    const productsFromDb = await this.loadProductsFromDB(productIds)
    const productIdsNotFromDB = this.getProductIdsNotFromDB(
      productsFromDb.map((p) => p.id),
      productIdsWithoutDash
    )

    const products = await this.getMlProduct(userId, productIdsNotFromDB)

    const productsWithSeller = await this.adjustSeller(products)

    const productsWithSellerAndMetadata = await this.addProductScrapeMetadata(
      productsWithSeller
    )

    // Convert to ProductCatalogs db Entity
    const productConverted: Array<ProductsCatalogs> =
      productsWithSellerAndMetadata.map((p) =>
        convertProductApiResponseToProductCatalogEntity(p, EntityType.Product)
      )

    await this.saveProductsToDb(productConverted)

    // Return the final list of products with all the necessary information
    return [...productsFromDb, ...productConverted]
  }

  private getProductExtraFields({
    product,
    currentPrice,
    quantitySold,
  }: {
    product: MLProduct
    currentPrice: number
    quantitySold: number
  }): MlProductExtraFields & { commissions: MLProductCommission } {
    quantitySold = quantitySold ?? 1
    const revenue = currentPrice * quantitySold

    const days = calculateDaysFrom(product.date_created)
    const daily_revenue = roundNumber(revenue / days)
    const has_promotion =
      currentPrice < product.price || product.price < product.original_price
    const commissions = this.calculateCommissions(currentPrice)
    return {
      ...product,
      has_promotion,
      revenue,
      quantity_sold: quantitySold,
      current_price: currentPrice,
      daily_revenue,
      commissions,
    }
  }

  public calculateCommissions(currentPrice: number): MLProductCommission {
    const fixedCommissionPrice = 0.12
    const fixedShipmentPrice = 22
    const maxPriceWithoutShipmentCommission = 79

    const shipmentCommission =
      currentPrice > maxPriceWithoutShipmentCommission ? fixedShipmentPrice : 0
    const percentageCommission = fixedCommissionPrice * currentPrice
    const totalCommission = shipmentCommission + percentageCommission
    const grossProfit = currentPrice - totalCommission

    const commissions = {
      fixedCommissionPrice,
      fixedShipmentPrice,
      shipmentCommission,
      currentPrice,
      percentageCommission,
      totalCommission,
      grossProfit,
    }

    return commissions
  }

  private getEanFromProductObj(product: MLProduct): string | null {
    try {
      return product.attributes
        .find(
          (a) =>
            a.id === "GTIN" ||
            a.id === "EAN" ||
            a.id === "UPC" ||
            a.id === "MPN"
        )
        .value_name?.toString()
    } catch (e) {
      return null
    }
  }

  private async loadProductsFromDB(
    productIds: string[]
  ): Promise<ProductsCatalogs[]> {
    return (await this.productRepository.getByIds(productIds)) ?? []
  }

  private getProductIdsNotFromDB(
    productIdsFromDb: string[],
    selectedProductsIds: string[]
  ): string[] {
    return selectedProductsIds.filter((p) => !productIdsFromDb.includes(p))
  }

  private async saveProductsToDb(products: ProductsCatalogs[]) {
    await this.productRepository.upsert(products)
  }

  private async adjustSeller(products: MLProduct[]) {
    const productsWithSeller = await Promise.all(
      products.map(async (p) => {
        const state = p.seller_address.state.id
        const seller: MLUser = {
          id: p.seller_id,
          address: { state },
        }
        return { ...p, seller }
      })
    )
    return productsWithSeller
  }

  private async addProductScrapeMetadata(productsWithSeller) {
    return await Promise.all(
      productsWithSeller.map(async (product) => {
        const productId = convertCatalogIdToProductId(product.id)
        const [scrapeProduct] = await Promise.all([
          productScraper(convertCatalogIdToProductId(product.id)),
        ])

        const extraFields = this.getProductExtraFields({
          product,
          currentPrice: scrapeProduct?.result.currentPrice,
          quantitySold: scrapeProduct?.result.quantitySold,
        })

        const ean = this.getEanFromProductObj(product)
        extraFields.ean = ean
        extraFields.has_video = scrapeProduct?.result?.hasVideo
        extraFields.picture_count = product.pictures.length
        extraFields.supermarket_eligible = product.tags.includes(
          "supermarket_eligible"
        )

        console.log("scrapProductPage =>", scrapeProduct.result)

        let category = null

        return {
          category,
          productId,
          ...product,
          ...extraFields,
        }
      })
    )
  }
}
