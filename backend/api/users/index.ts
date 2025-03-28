import express from "express";
import { listUsersRouter } from "./list";

export const userRouter = express.Router();

userRouter.use("/list", listUsersRouter);
