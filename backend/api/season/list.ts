import { Collection, ObjectId } from "mongodb";
import { db } from "../../database";
import { isAdmin, userFromToken } from "../../functions";
import express, { Request } from "express";
import { Season, User } from "../../contracts";
import { Nullable } from "../../types";

export const listRouter = express.Router();

const database = db();

listRouter.get(
  "/",
  async (req: Request<{ take?: number; skip?: number }>, res) => {
    const user = await userFromToken(req.headers.authorization);

    if (!user || !isAdmin(user)) {
      res.status(403);
      return;
    }

    const seasons: Collection<Season> = database.collection("seasons");
    const take: Nullable<number> = req.params.take ?? null;
    const skip: Nullable<number> = req.params.skip ?? null;

    res.json({
      list: await seasons
        .find({})
        .skip(skip ?? 0)
        .limit(take ?? Infinity)
        .toArray(),
    });
  }
);
