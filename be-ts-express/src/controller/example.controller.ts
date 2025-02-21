import { controller, httpGet } from "inversify-express-utils"
import { injectable } from "inversify"

@controller("/example")
export class ExampleController {
  @httpGet("/")
  public getExample() {
    return { message: "Hello from ExampleController!" }
  }
}
