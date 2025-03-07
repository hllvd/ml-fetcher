import { CatalogApiResponse } from "../../api-response/api/catalog-response.models"

export interface ICatalogService {
  catalogSummary({
    catalogId,
    userId,
  }: {
    catalogId: string
    userId: string
  }): Promise<CatalogApiResponse>
}
