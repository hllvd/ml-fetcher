import { injectable } from "inversify"
import dataSource from "../db/data-source"
import { BrandModel } from "../entities/sql/brand-model.entity"
import { MLProduct } from "../models/dto/ml-product.models"

@injectable()
export class BrandRepository implements IBrandRepository {
  private repository = dataSource.manager.getRepository(BrandModel)

  async brandModelFieldHandler({
    brand,
    model,
    color,
  }: {
    brand?: string
    model?: string
    color?: string
  }): Promise<BrandModel> {
    const existingBrandModel = await this.repository.findOne({
      where: { brand, model, color },
    })

    if (existingBrandModel) {
      return existingBrandModel
    }

    console.log("new brand model created")
    const brandModel = new BrandModel()
    brandModel.brand = brand
    brandModel.model = model
    brandModel.color = color
    return await this.repository.save(brandModel)
  }

  getBrandModel(product: MLProduct): {
    model: string
    brand: string
    color: string
    detailed_model: string
  } | null {
    if (!product?.attributes) return null

    const attributeList = ["COLOR", "MODEL", "BRAND", "DETAILED_MODEL"]
    const selectedAttributes = product.attributes.filter((e) =>
      attributeList?.includes(e.id)
    )

    return selectedAttributes?.length > 0
      ? selectedAttributes.reduce((acc, e) => {
          acc[e.id.toLowerCase()] = e.value_name
          return acc
        }, {})
      : null
  }

  async findOrInsert({ brand, model, color }: BrandModel): Promise<BrandModel> {
    const existingBrandModel = await this.repository.findOne({
      where: { brand, model, color },
    })

    if (existingBrandModel) {
      return existingBrandModel
    }

    const newBrandModel = new BrandModel()
    newBrandModel.brand = brand
    newBrandModel.model = model
    newBrandModel.color = color
    return await this.repository.save(newBrandModel)
  }
}

// src/interfaces/repositories/IBrandRepository.ts

export interface IBrandRepository {
  brandModelFieldHandler(params: {
    brand?: string
    model?: string
    color?: string
  }): Promise<BrandModel>

  getBrandModel(product: MLProduct): {
    model: string
    brand: string
    color: string
    detailed_model: string
  } | null

  findOrInsert(params: {
    brand: string
    model: string
    color: string
  }): Promise<BrandModel>
}
