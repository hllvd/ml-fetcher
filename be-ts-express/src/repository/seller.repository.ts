import dataSource from "../db/data-source"
import { Seller } from "../entities/sql/seller.entity"

const upsert = async (seller: Seller): Promise<Seller> => {
  await dataSource.manager.getRepository(Seller).upsert(seller, ["id"])
  return seller
}

export default { upsert }
