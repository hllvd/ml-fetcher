import { MLUser } from "../../dto/ml-user.models"

export interface ISellerApiClient {
  fetchSeller({
    userId,
    sellerId,
  }: {
    userId: string
    sellerId: string
  }): Promise<MLUser>
}
