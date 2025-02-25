import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm"
import { EntityType } from "../../enums/entity-type.enum"
import { BrandModel } from "./brand-model.entity"
import { CatalogFields } from "./catalog-fields.entity"
import { Categories } from "./categories.entity"
import { Jobs } from "./jobs.entity"
import { SearchPosition } from "./search-positions.entity"
import { Seller } from "./seller.entity"
import { StateFields } from "./state-fields.entity"
import { ProductViewsSummary } from "./views-summary.entity"

@Index("IDX_CUSTOM_INDEX", ["id", "type"])
@Entity({
  engine: "InnoDB",
})
export class ProductsCatalogs {
  @PrimaryColumn({ unique: true })
  id: string

  @Column({ type: "tinyint" })
  type: EntityType

  @Column({ nullable: true })
  title: string

  @Column({ nullable: true })
  domainId: string

  @Column({ nullable: true, type: "varchar", length: 16 })
  officialStoreId: string

  @Column({ nullable: true, type: "float" })
  price: number

  @Column({ nullable: true, type: "float" })
  basePrice: number

  @Column({ nullable: true, type: "float" })
  originalPrice: number

  @Column({ nullable: true, type: "varchar", length: 32 })
  listingTypeId: string

  @Column({ nullable: true })
  permalink: string

  @Column({ nullable: true })
  videoId: string

  @Column({ type: "varchar", nullable: true })
  ean: string

  @Column({ nullable: true })
  thumbnail: string

  @Column({ nullable: true })
  pictureCount: number

  @Column({ nullable: true })
  health: number

  @Column({ nullable: true })
  shippingFreeShipping: boolean

  @Column({ nullable: true, type: "varchar", length: 20 })
  shippingLogisticType: string

  @Column({ nullable: true, type: "varchar", length: 15 })
  catalogProductId: string

  @Column({ nullable: true })
  catalogListing: boolean

  @Column({ nullable: true, type: "varchar", length: 27 })
  dateCreated: string

  @Column({ nullable: true })
  tagsGoodQualityThumbnail: boolean

  @Column({ nullable: true })
  tagsGoodQualityPicture: boolean

  @Column({ nullable: true })
  hasPromotion: boolean

  @Column({ nullable: true })
  hasVideo: boolean

  @Column({ nullable: true })
  supermarketEligible: boolean

  @Column({ nullable: true }) // fix that
  isKit: boolean

  @Column({ nullable: true })
  revenue: number

  @Column({ nullable: true })
  quantitySold: number

  @Column({ nullable: true, type: "float" })
  currentPrice: number

  @Column({ nullable: true, type: "float" })
  dailyRevenue: number

  @UpdateDateColumn({ type: "datetime" })
  metadataUpdatedAt: Date

  @OneToMany(() => Jobs, (job) => job.product, { nullable: true })
  jobs: Jobs[]

  @OneToMany(() => SearchPosition, (sp) => sp.product, { nullable: true })
  searchPosition: SearchPosition[] | null

  @ManyToOne(() => Categories, (category) => category.id, { nullable: true })
  category: Categories | null

  @ManyToOne(() => Seller, (seller) => seller.id)
  seller: Seller | null

  @ManyToOne(() => BrandModel, (brandModel) => brandModel, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  brandModel: BrandModel | null

  @OneToOne(() => ProductViewsSummary, (views) => views, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  views: ProductViewsSummary | null

  @OneToMany(() => StateFields, (stateField) => stateField.productCatalog, {
    nullable: true,
  })
  stateFields: StateFields[] | null

  @OneToOne(() => CatalogFields, (catalogFields) => catalogFields, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  catalogFields: CatalogFields | null
}
/**
- catalog_old_post Anuncio mais antigo
* - Categorias relacionadas (vasculhar em todos os anuncios )
* - catalog_title
* - catalog_brand
* - product_id
*
* - summary_created
* - summary_userId
* - summary_ttl
**/
