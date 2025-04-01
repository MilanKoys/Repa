import express, { Request, Response } from "express";
import Joi, { ValidationResult } from "joi";
import { LoginSchema, User } from "../../contracts";
import { db } from "../../database";
import bcrypt from "bcrypt";
import { generateSession } from "../../functions";

export const loginRouter = express.Router();

const database = db();

const loginSchema: Joi.ObjectSchema<LoginSchema> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

loginRouter.post("/", async (req: Request, res: Response) => {
  const data: ValidationResult<LoginSchema> = loginSchema.validate(req.body);
  if (data.error) {
    res.sendStatus(401);
    return;
  }

  const users = database.collection("users");
  const foundUser = await users.findOne<User>({
    email: data.value.email.toLowerCase(),
  });

  if (
    !foundUser ||
    !bcrypt.compareSync(data.value.password, foundUser.password)
  ) {
    res.sendStatus(403);
    return;
  }

  const token = await generateSession(foundUser);
  if (!token) {
    res.sendStatus(500);
    return;
  }

  res.json({ token });
});
