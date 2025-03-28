import express from "express";
import { db } from "../../database";
import { userFromToken, isAdmin } from "../../functions";
import { Season } from "../../contracts";
import { Collection } from "mongodb";

export const liveSeasonRouter = express.Router();

const database = db();

liveSeasonRouter.get("/", async (req, res) => {
  const user = await userFromToken(req.headers.authorization);
  if (!user || !isAdmin(user)) {
    res.json(403);
    return;
  }

  const id = req.query["id"];
  if (!id) {
    res.status(401);
    return;
  }

  const seasons: Collection<Season> = database.collection("seasons");
  const foundSeason = await seasons.findOne({ id });

  if (!foundSeason) {
    res.status(401);
    return;
  }

  await seasons.updateOne({ live: true }, { $set: { live: false } });
  await seasons.updateOne({ id }, { $set: { live: true } });
  res.status(200);
});
