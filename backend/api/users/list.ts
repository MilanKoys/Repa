import { Collection } from "mongodb";
import { db } from "../../database";
import { isAdmin, userFromToken } from "../../functions";
import express, { Request } from "express";
import { User } from "../../contracts";
import { Nullable } from "../../types";

export const listUsersRouter = express.Router();

const database = db();

listUsersRouter.get(
  "/",
  async (req: Request<{ take?: number; skip?: number }>, res) => {
    const user = await userFromToken(req.headers.authorization);

    if (!user || !isAdmin(user)) {
      res.sendStatus(403);
      return;
    }

    const users: Collection<User> = database.collection("users");
    const take: Nullable<number> = req.params.take ?? null;
    const skip: Nullable<number> = req.params.skip ?? null;

    res.json({
      list: (
        await users
          .find({})
          .skip(skip ?? 0)
          .limit(take ?? Infinity)
          .toArray()
      ).map((user) => {
        return {
          id: user.id,
          email: user.email,
          created: user.created,
          roles: user.roles,
        };
      }),
    });
  }
);
