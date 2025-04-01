import { Collection } from "mongodb";
import { db } from "../../database";
import { isAdmin, userFromToken } from "../../functions";
import express, { Request } from "express";
import { User } from "../../contracts";
import Joi from "joi";
import bcrypt from "bcrypt";

export const editUserRouter = express.Router();

const database = db();

const editUserSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  roles: Joi.array().items(Joi.number()),
});

editUserRouter.post(
  "/:id",
  async (req: Request<{ take?: number; skip?: number }>, res) => {
    const user = await userFromToken(req.headers.authorization);
    if (!user || !isAdmin(user)) {
      res.sendStatus(403);
      return;
    }

    const data = editUserSchema.validate(req.body);
    if (data.error) {
      res.status(401).json(data.error);
      return;
    }

    const users: Collection<User> = database.collection("users");
    const foundUser = await users.findOne({ id: data.value.id });
    if (!foundUser) {
      res.status(403).json({ error: "User with set email doesn't exist" });
      return;
    }

    await users.updateOne(
      { id: data.value.id },
      {
        $set: {
          ...data.value,
          password: data.value.password
            ? bcrypt.hashSync(
                data.value.password,
                Math.floor(Math.random() * 10)
              )
            : foundUser.password,
        },
      }
    );

    res.sendStatus(200);
  }
);
