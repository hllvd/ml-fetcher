import { MLUser } from "../../models/dto/ml-user.models"
import { ISellerApiClient } from "../../models/interfaces/sellers/i-seller-api-client.interface"
import { fetchSeller } from "./api/users"

export class SellerApiClient implements ISellerApiClient {
  private _userId: string
  constructor(userId: string) {
    this._userId = userId
  }
  async fetchSeller(sellerId: string): Promise<MLUser> {
    const response = await fetchSeller({ userId: this._userId, sellerId })
    if (response) return response
    throw new Error(`Seller ${sellerId} not found`)
  }
}
