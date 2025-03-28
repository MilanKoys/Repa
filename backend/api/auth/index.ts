import express from "express";
import { loginRouter } from "./login";
import { meRouter } from "./me";

export const authRouter = express.Router();

authRouter.use("/login", loginRouter);
authRouter.use("/me", meRouter);
