import { Router } from "express";
import { signIn, signOut, verifyInvitationToken, activateAccount } from "../controlers/auth.controler.js";
import { validateInvitationToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.get("/verify-invitation", validateInvitationToken, verifyInvitationToken);
authRouter.post("/activate-account", validateInvitationToken, activateAccount);

export default authRouter
