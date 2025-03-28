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

async function userFromToken(token: string): Promise<Nullable<User>> {
  const sessions: Collection<Session> = database.collection("sessions");
  const users: Collection<User> = database.collection("users");
  const session = await sessions.findOne({ token });
  if (!session) {
    return null;
  }

  const user = await users.findOne({ id: session.id });
  if (!user) {
    return null;
  }

  return user;
}

app.get("/me", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(403);
    return;
  }

  const user = await userFromToken(token);

  if (!user) {
    res.status(403);
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    created: user.created,
  });
});

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
