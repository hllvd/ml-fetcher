import { Entity } from "typeorm"
import { BrandModel } from "../entities/sql/brand-model.entity"
import { CatalogFields } from "../entities/sql/catalog-fields.entity"
import { ProductsCatalogs } from "../entities/sql/products-catalogs.entity"
import { Seller } from "../entities/sql/seller.entity"
import { EntityType } from "../enums/entity-type.enum"
import { CatalogApiResponse } from "../models/api-response/api/catalog-response.models"
import { ProductApiResponse } from "../models/api-response/api/product-response.models"
import { MLUser } from "../models/dto/ml-user.models"
import { getAttributeValueName } from "../utils/ml.utils"

export const convertCatalogApiResponseToProductCatalogEntity = (
  catalogApiResponse: CatalogApiResponse,
  type: EntityType
): ProductsCatalogs => {
  const product = _convertProductApiResponseToProductCatalogEntityCommonFields(
    catalogApiResponse,
    type
  )
  product.id = catalogApiResponse.catalogId
  //product.category = catalogApiResponse.categoryId
  product.domainId = catalogApiResponse.domainId
  product.hasVideo = catalogApiResponse.hasVideo
  product.supermarketEligible = catalogApiResponse.supermarketEligible
  product.price = catalogApiResponse.price.best
  product.basePrice = catalogApiResponse.price.best
  product.revenue = catalogApiResponse.revenue
  product.currentPrice = catalogApiResponse.price.best
  product.dailyRevenue = catalogApiResponse.dailyRevenue
  product.quantitySold = catalogApiResponse.quantitySold

  return product
}
export const convertProductApiResponseToProductCatalogEntity = (
  productApiResponse: ProductApiResponse,
  type: EntityType
): ProductsCatalogs => {
  const product = _convertProductApiResponseToProductCatalogEntityCommonFields(
    productApiResponse,
    type
  )
  product.id = productApiResponse.id
  //product.category = productApiResponse.category
  product.domainId = productApiResponse.domain_id
  product.supermarketEligible = productApiResponse.supermarket_eligible
  product.officialStoreId = productApiResponse.official_store_id
    ? productApiResponse.official_store_id.toString()
    : null
  product.price = productApiResponse.price
  product.basePrice = productApiResponse.base_price
  product.originalPrice = productApiResponse.original_price
  product.listingTypeId = productApiResponse.listing_type_id
  product.pictureCount = productApiResponse.picture_count
  product.videoId = productApiResponse.video_id
  product.isKit = productApiResponse.attributes.find((a) => a.id === "IS_KIT")
    ?.value_name
    ? true
    : productApiResponse.title.toLowerCase().includes("kit")

  product.health = productApiResponse.health
  product.tagsGoodQualityThumbnail = productApiResponse.tags?.includes(
    "good_quality_thumbnail"
  )
  product.tagsGoodQualityPicture = productApiResponse.tags?.includes(
    "good_quality_picture"
  )
  product.shippingFreeShipping = productApiResponse.shipping?.free_shipping
  product.shippingLogisticType = productApiResponse.shipping.logistic_type
  product.catalogProductId = productApiResponse.catalog_product_id
  product.catalogListing = productApiResponse.catalog_listing
  product.dateCreated = productApiResponse.date_created
  product.hasPromotion = productApiResponse.has_promotion
  product.hasVideo = productApiResponse.has_video
  product.revenue = productApiResponse.revenue
  product.quantitySold =
    productApiResponse.initial_quantity || productApiResponse.quantity_sold
  product.currentPrice = productApiResponse.current_price
  product.dailyRevenue = productApiResponse.daily_revenue

  product.brandModel = new BrandModel()
  product.brandModel = _convertBrandFields(productApiResponse.attributes)

  product.seller = new Seller()
  product.seller = _convertSeller(productApiResponse.seller)

  return product
}

const _convertSeller = (seller) => {
  const sellerEntity = new Seller()
  sellerEntity.id = seller.id
  sellerEntity.nickname = seller.nickname
  sellerEntity.permalink = seller.permalink
  sellerEntity.sellerAddressStateId = seller.address?.state
  sellerEntity.userType = seller.user_type
  sellerEntity.sellerReputationLevelId = seller.seller_reputation?.level_id
  sellerEntity.sellerReputationPowerSellerStatus =
    seller.seller_reputation?.power_seller_status
  return { ...sellerEntity } as Seller
}

const _convertBrandFields = (attributes) => {
  const brand = getAttributeValueName(attributes, "BRAND")
  const color = getAttributeValueName(attributes, "COLOR")
  const model = getAttributeValueName(attributes, "MODEL")
  return {
    brand,
    color,
    model,
  } as BrandModel
}

export const catalogInfoToCatalogFieldsEntityConverter = async ({
  catalogFields,
  catalogInfo,
}: {
  catalogFields: CatalogFields
  catalogInfo: CatalogApiResponse
}) => {
  const {
    full = null,
    medalGold = null,
    medalLider = null,
    medalPlatinum = null,
  } = catalogInfo?.position || {}

  const {
    best = null,
    secondBest = null,
    full: priceFull = null,
    top5Avg = null,
  } = catalogInfo.price || {}
  console.log("catalogInfo", catalogInfo.length)

  catalogFields.id = catalogInfo.catalogId
  catalogFields.length = catalogInfo?.length
  catalogFields.mlOwner = catalogInfo?.mlOwner
  catalogFields.positionFull = full
  catalogFields.positionMedalGold = medalGold
  catalogFields.positionMedalLider = medalLider
  catalogFields.positionMedalPlatinum = medalPlatinum

  catalogFields.priceBest = best
  catalogFields.priceFull = priceFull
  catalogFields.priceSecond = secondBest
  catalogFields.priceTop5Avg = top5Avg

  //catalogFields.productsCatalogs = catalogInfo.catalogId
  return catalogFields
}

const _convertProductApiResponseToProductCatalogEntityCommonFields = (
  productApiResponse: ProductApiResponse | CatalogApiResponse,
  type: EntityType
): ProductsCatalogs => {
  const product = new ProductsCatalogs()
  product.type = type
  product.title = productApiResponse.title
  product.permalink = productApiResponse.permalink
  product.thumbnail = productApiResponse.thumbnail
  product.ean = productApiResponse.ean
  return product
}

export const convertMLUserFromApiResponseToSellerEntity = (
  mlUser: MLUser
): Seller => {
  const seller = new Seller()
  seller.id = mlUser.id
  seller.nickname = mlUser.nickname
  seller.permalink = mlUser.permalink
  seller.sellerAddressStateId = mlUser.address.state
  seller.userType = mlUser.user_type
  seller.sellerReputationLevelId = mlUser.seller_reputation.level_id
  seller.sellerReputationPowerSellerStatus =
    mlUser.seller_reputation.power_seller_status
  seller.sellerReputationTransactionsTotal =
    mlUser?.seller_reputation?.transactions?.total
  seller.sellerReputationTransactionsTotal =
    mlUser?.seller_reputation?.transactions?.total
  return seller
}
