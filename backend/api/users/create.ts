import { Collection } from "mongodb";
import { db } from "../../database";
import { isAdmin, userFromToken } from "../../functions";
import express, { Request } from "express";
import { User } from "../../contracts";
import Joi from "joi";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export const createUserRouter = express.Router();

const database = db();

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  roles: Joi.array().items(Joi.number()),
});

createUserRouter.post(
  "/",
  async (req: Request<{ take?: number; skip?: number }>, res) => {
    const user = await userFromToken(req.headers.authorization);
    if (!user || !isAdmin(user)) {
      res.sendStatus(403);
      return;
    }

    const data = createUserSchema.validate(req.body);
    if (data.error) {
      res.status(401).json(data.error);
      return;
    }

    const users: Collection<User> = database.collection("users");
    const foundUser = await users.findOne({ email: data.value.email });
    if (foundUser) {
      res.status(403).json({ error: "User with set email already exists" });
      return;
    }

    const newUser: User = {
      created: new Date().getTime(),
      email: data.value.email,
      password: bcrypt.hashSync(
        data.value.password,
        Math.floor(Math.random() * 10)
      ),
      id: nanoid(),
      roles: data.value.roles ?? [],
    };

    await users.insertOne(newUser);
    res.json(newUser);
  }
);
