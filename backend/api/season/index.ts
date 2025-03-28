import express from "express";
import { createRouter } from "./create";
import { liveSeasonRouter } from "./getLive";
import { setSeasonRouter } from "./live";
import { listRouter } from "./list";

export const seasonRouter = express.Router();

seasonRouter.use("/", createRouter);
seasonRouter.use("/list", listRouter);
seasonRouter.use("/live", liveSeasonRouter);
seasonRouter.use("/:id", setSeasonRouter);
