import express, { Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import Joi, { ValidationResult } from "joi";
import bcrypt from "bcrypt";

import { Collection, MongoClient } from "mongodb";

import { config } from "./config";
import { nanoid } from "nanoid";
import { LoginSchema, Roles, Session, User } from "./contracts";

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

async function userFromToken(token?: string): Promise<Nullable<User>> {
  if (!token) {
    return null;
  }

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

async function isAdmin(user: User) {
  return user.roles.findIndex((r) => r === Roles.Admin) > -1;
}

app.get("/me", async (req, res) => {
  const user = await userFromToken(req.headers.authorization);

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

interface Season {
  id: string;
  date: number;
  live: boolean;
}

const seasonSchema: Joi.ObjectSchema<Season> = Joi.object({
  date: Joi.number(),
  live: Joi.boolean(),
});

app.post("season", async (req, res) => {
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

app.get("/season/live", async (req, res) => {
  const seasons: Collection<Season> = database.collection("seasons");
  const foundSeason = await seasons.findOne({ live: true });

  if (!foundSeason) {
    res.json(null);
    return;
  }

  res.json(foundSeason);
});

app.get("/season/:id", async (req, res) => {
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

app.get("/", (req, res) => {
  res.json({ message: "Hello world!" });
});

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
