import { Request, Response } from "express";
import { ResponseTokenDto } from "../../dto/Token/res-token.dto";
import { RequestUserDto } from "../../dto/User/req-user.dto";
import { asyncHandler } from "../../middleware/async";
import { extractBearerToken } from "../../utils/extractBearerToken";
import {
  // createPaymentSession,
  getOauthGoogleToken,
  handleOauthGoogle,
  handleResetPassword,
  handleRevokeToken,
  handleSignIn,
  handleSignUp,
  handleVerifyAccessToken,
  handleVerifyResetPassword,
} from "./auth.service";
import { URL } from "url";
// import { redisClient } from "../../redis-client";

const bcrypt = require("bcrypt");

export const signUpController = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body as RequestUserDto;
    let createUserDto = new RequestUserDto({
      email: email,
      username: username,
      password: password,
      subscription: "BASIC",
    });

    await handleSignUp(createUserDto);

    res.status(200).json({
      success: true,
    });
  }
);

export const signInController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    let tokens = await handleSignIn(email, password);

    res.status(200).json({
      success: true,
      ...tokens,
    });
  }
);

export const verifyController = asyncHandler(
  async (req: Request, res: Response) => {
    let token = extractBearerToken(req);
    // const cachedDecoded = await redisClient.get(token);

    // if (cachedDecoded !== null) {
    //   return res.status(200).json({
    //     success: true,
    //     data: JSON.parse(cachedDecoded),
    //   });
    // }

    const decoded = handleVerifyAccessToken(token);
    // await redisClient.set(token, JSON.stringify(decoded), {
    //   EX: 1,
    // });

    res.status(200).json({
      success: true,
      data: decoded,
    });
  }
);

export const revokeTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    let token = extractBearerToken(req);

    let resToken: ResponseTokenDto = await handleRevokeToken(token);

    return res.status(200).json({
      success: true,
      ...resToken,
    });
  }
);

export const oauthGoogleController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("oauthGoogleController");
    const { code } = req.query;
    const data = await getOauthGoogleToken(String(code));
    const { id_token, access_token } = data;

    let resToken = await handleOauthGoogle(id_token, access_token);

    const url = new URL(process.env.CLIENT_HOST + "/auth/oauth/google");
    url.searchParams.append("access_token", resToken.access_token);
    url.searchParams.append("refresh_token", resToken.refresh_token);

    res.redirect(302, url.href);
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    let email = req.params.email;

    await handleResetPassword(email);

    res.status(200).json({
      success: true,
    });
  }
);

export const verifyResetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    let { code, email, newPassword } = req.body;
    if (!code || !email) {
      throw new Error("invalid credentials");
    }

    await handleVerifyResetPassword(code, email, newPassword);

    res.status(200).json({
      success: true,
    });
  }
);

// export const createPaymentSessionController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const fingerprints = req.body.fingerprints;
//     const access_token = req.body.access_token;
//     const refresh_token = req.body.refresh_token;
//     const user_info = req.body.user_info;
//     const payload = {
//       access_token: access_token,
//       refresh_token: refresh_token,
//       user_info: user_info,
//     };

//     await createPaymentSession(fingerprints, payload);

//     res.status(200).json({
//       success: true,
//     });
//   }
// );

// export const getPaymentSessionController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const fingerprints = req.params.fingerprints;
//     const payment_session = await redisClient.get(fingerprints);

//     if (!payment_session) {
//       throw new Error("payment session not found");
//     }

//     res.status(200).json({
//       success: true,
//       data: payment_session,
//     });
//   }
// );
