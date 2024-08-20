import { Router, Request, Response } from "express";
import {
  // createPaymentSessionController,
  // getPaymentSessionController,
  oauthGoogleController,
  resetPasswordController,
  revokeTokenController,
  signInController,
  signUpController,
  verifyController,
  verifyResetPasswordController,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/sign-up", signUpController);
authRouter.post("/sign-in", signInController);
authRouter.post("/reset-password/:email", resetPasswordController);
authRouter.post("/verify-reset-password", verifyResetPasswordController);

// Microservices call this route for verification
authRouter.post("/verify", verifyController);

authRouter.post("/revoke", revokeTokenController);

authRouter.get("/oauth/google", oauthGoogleController);

authRouter.get("/health", (req: Request, res: Response) => {
  res.status(200).json({});
});

// authRouter.post("/create-payment-session", createPaymentSessionController);
// authRouter.get(
//   "/get-payment-session/:fingerprints",
//   getPaymentSessionController
// );
