import { MLUser } from "../../dto/ml-user.models"

export interface ISellerApiClient {
  fetchSeller(sellerId: string): Promise<MLUser>
}
