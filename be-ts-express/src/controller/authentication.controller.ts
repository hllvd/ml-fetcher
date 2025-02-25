import { Request, Response } from "express"
import { controller, httpGet } from "inversify-express-utils/lib/decorators"
import mlAuthService from "../services/ml/auth.ml.service"

@controller("/login")
export class AuthenticationController {
  @httpGet("/")
  public async login(req: Request, res: Response) {
    const mlLoginUrl = await mlAuthService.loginUrl()
    console.log(mlLoginUrl.toString())
    res.redirect(mlLoginUrl.toString())
  }

  @httpGet("/authentication")
  public async authentication(req: Request, res: Response) {
    const code = req.query?.code.toString()
    const { access_token, user_id, refresh_token } =
      await mlAuthService.authentication(code)
    res.status(202).json({ access_token, user_id, refresh_token })
  }
}
