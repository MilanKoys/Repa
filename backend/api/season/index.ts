import express from "express";
import { createRouter } from "./create";
import { liveSeasonRouter } from "./getLive";
import { setSeasonRouter } from "./live";

export const seasonRouter = express.Router();

seasonRouter.use("/", createRouter);
seasonRouter.use("/live", liveSeasonRouter);
seasonRouter.use("/:id", setSeasonRouter);
