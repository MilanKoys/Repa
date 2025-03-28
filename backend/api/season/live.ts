import express, { Request, Response } from "express";
import Joi from "joi";
import { db } from "../../database";
import { userFromToken, isAdmin } from "../../functions";
import { Season } from "../../contracts";
import { Collection } from "mongodb";
import { nanoid } from "nanoid";

export const setSeasonLiveRouter = express.Router();

const database = db();

setSeasonLiveRouter.get("/season/live", async (req, res) => {
  const seasons: Collection<Season> = database.collection("seasons");
  const foundSeason = await seasons.findOne({ live: true });

  if (!foundSeason) {
    res.json(null);
    return;
  }

  res.json(foundSeason);
});
