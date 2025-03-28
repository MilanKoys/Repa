import express, { Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import Joi, { ValidationResult } from "joi";
import bcrypt from "bcrypt";

import { Collection, MongoClient } from "mongodb";

import { config } from "./config";
import { nanoid } from "nanoid";
import { LoginSchema, Session, User } from "./contracts";

type Nullable<T> = T | null;

const app = express();
const port = config?.port ?? 4000;
const database = new MongoClient(config.databaseConnectionString).db(
  config.databaseName
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("tiny"));

const loginSchema: Joi.ObjectSchema<LoginSchema> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

async function generateSession(user: User): Promise<Nullable<string>> {
  const sessions: Collection<Session> = database.collection("sessions");
  const token: string = nanoid();
  const result = await sessions.insertOne({
    token,
    id: user.id,
    created: new Date().getTime(),
  });

  if (!result.acknowledged) return null;
  return token;
}

app.post("/login", async (req: Request, res: Response) => {
  const data: ValidationResult<LoginSchema> = loginSchema.validate(req.body);
  if (data.error) {
    res.status(401);
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
    res.status(403);
    return;
  }

  const token = await generateSession(foundUser);
  if (!token) {
    res.status(500);
    return;
  }

  res.json({ token });
});

app.get("/", (req, res) => {
  res.json({ message: "Hello world!" });
});

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
