import express from "express";
import { db } from "../../database";
import { Season } from "../../contracts";
import { Collection } from "mongodb";

export const setSeasonRouter = express.Router();

const database = db();

setSeasonRouter.get("/", async (req, res) => {
  const seasons: Collection<Season> = database.collection("seasons");
  const foundSeason = await seasons.findOne({ live: true });

  if (!foundSeason) {
    res.json(null);
    return;
  }

  res.json(foundSeason);
});
