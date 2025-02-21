import { Seller } from "../../entities/sql/seller.entity"
import { MLUser } from "../../models/dto/ml-user.models"
import { ISellerConverter } from "../../models/interfaces/sellers/i-seller-converter.interface"

export class SellerConverter implements ISellerConverter {
  convert(mlUser: MLUser) {
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
}
