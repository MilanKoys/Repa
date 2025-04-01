import express from "express";
import { listUsersRouter } from "./list";
import { createUserRouter } from "./create";
import { editUserRouter } from "./edit";

export const userRouter = express.Router();

userRouter.use("/list", listUsersRouter);

userRouter.use("/create", createUserRouter);

userRouter.use("/edit", editUserRouter);
