import express, { Request, Response } from "express";
import Joi from "joi";
import { db } from "../../database";
import { userFromToken, isAdmin } from "../../functions";
import { Season } from "../../contracts";
import { Collection } from "mongodb";
import { nanoid } from "nanoid";

export const createSeasonRouter = express.Router();

const database = db();

const seasonSchema: Joi.ObjectSchema<Season> = Joi.object({
  date: Joi.number(),
  live: Joi.boolean(),
});

createSeasonRouter.post("season", async (req, res) => {
  const user = await userFromToken(req.headers.authorization);
  if (!user || !isAdmin(user)) {
    res.json(403);
    return;
  }

  const data = seasonSchema.validate(req.body);
  if (data.error) {
    res.status(401);
    return;
  }

  const seasons: Collection<Season> = database.collection("seasons");
  const foundSeason = await seasons.findOne({ date: data.value.date });
  if (foundSeason) {
    res.json({ id: foundSeason.id });
    return;
  }

  const id: string = nanoid();
  const result = await seasons.insertOne({
    id,
    date: data.value.date,
    live: false,
  });

  if (!result.acknowledged) {
    res.status(500);
    return;
  }

  res.json({ id });
});
