import { MLProduct } from "../../../models/dto/ml-product.models"
import { IProductApiClient } from "../../../models/interfaces/products/i-product-api-client.interface"
import { fetchMl } from "../fetcher-api.ml.service"

export class ProductApiClient implements IProductApiClient {
  public async fetchProducts(
    userId: string,
    productIdStr: string
  ): Promise<MLProduct[]> {
    const options = {
      userId,
      method: "GET",
    }

    /**
     * TODO: DIP Violation - Directly depends on `fetchMl`, a concrete implementation.
     * Refactor to depend on an abstraction (e.g., `IMlApiClient`).
     * Steps:
     * 1. Create an `IMlApiClient` interface.
     * 2. Implement `MlApiClient` that uses `fetchMl`.
     * 3. Inject `IMlApiClient` into this class via the constructor.
     * Example:
     * constructor(private mlApiClient: IMlApiClient) {}
     * Then replace `fetchMl` with `this.mlApiClient.fetch`.
     */
    const productsObj = await fetchMl(`/items?ids=${productIdStr}`, options)
    return productsObj
      .filter((product) => product.code === 200)
      .map((product) => product.body)
  }
}
