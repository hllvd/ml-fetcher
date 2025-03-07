import { MLUser } from "../../../models/dto/ml-user.models"
import { ISellerApiClient } from "../../../models/interfaces/sellers/i-seller-api-client.interface"
import { fetchSeller } from "./users"

export class SellerApiClient implements ISellerApiClient {
  private _userId: string
  constructor(userId: string) {
    console.log("userId", userId)
    this._userId = userId
  }
  public async fetchSeller({
    sellerId,
    userId,
  }: {
    sellerId: string
    userId: string
  }): Promise<MLUser> {
    const response = await fetchSeller({ userId, sellerId })
    if (response) return response
    throw new Error(`Seller ${sellerId} not found`)
  }
}
