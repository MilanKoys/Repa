import { scryptSync, timingSafeEqual, randomUUID } from "crypto";

import type {
  CreateUser,
  HandlerRequest,
  HandlerResponse,
  LoginUser,
  Session,
  Undefined,
  User,
} from "@types";

import { Validator } from "./validator.js";
import { Api } from "./api.js";
import { database } from "./database.js";
import { Role } from "#enums";

const USERS_COLLECTION: string = "users";
const SESSIONS_COLLECTION: string = "sessions";

const HASH_LENGTH: number = 10;
const HASH_ENCODING: "hex" = "hex";
const HASH_SALT: string = "salt";

const DEFAULT_TAKE: string = "10";
const DEFAULT_SKIP: string = "0";

const router = new Api();

const validator = new Validator();

router.get("/list", (request: HandlerRequest, response: HandlerResponse) => {
  if (!request.headers) {
    response.status(400);
    return response.end();
  }

  const token: Undefined<string> = request.headers.authorization;

  if (!token) {
    response.status(401);
    return response.end();
  }

  const session: Undefined<Session> = database.findOne<Session>(
    SESSIONS_COLLECTION,
    { token },
  );

  if (!session) {
    response.status(401);
    return response.end();
  }

  const user: Undefined<User> = database.findOne(USERS_COLLECTION, {
    email: session.email,
  });

  if (!user) {
    response.status(401);
    return response.end();
  }

  if (user.role !== Role.ADMIN) {
    response.status(403);
    return response.end();
  }

  const takeString: Undefined<string | string[]> =
    request.headers.take ?? DEFAULT_TAKE;
  const skipString: Undefined<string | string[]> =
    request.headers.skip ?? DEFAULT_SKIP;

  if (typeof takeString !== "string" || typeof skipString !== "string") {
    response.status(400);
    return response.end();
  }

  const take: number = parseInt(takeString);
  const skip: number = parseInt(skipString);

  const users: User[] = database
    .find<User>(USERS_COLLECTION, "")
    .slice(skip, take + skip);

  const stripperUsers: Partial<User>[] = users.map((user): Partial<User> => {
    let partialUser: Partial<User> = user;
    delete partialUser.password;
    return user;
  });

  response.json(stripperUsers);
});

router.get("/logout", (request: HandlerRequest, response: HandlerResponse) => {
  if (!request.headers) {
    response.status(400);
    return response.end();
  }

  const token: Undefined<string> = request.headers.authorization;

  if (!token) {
    response.status(400);
    return response.end();
  }

  const session: Undefined<Session> = database.findOne<Session>(
    SESSIONS_COLLECTION,
    { token },
  );

  if (!session) return response.end();

  database.deleteOne(SESSIONS_COLLECTION, session);
});

router.post("/login", (request: HandlerRequest, response: HandlerResponse) => {
  const body: LoginUser = request.body;
  const loginUserSchema = validator.object({
    email: validator.string().email().required(),
    password: validator.string().min(8).required(),
  });

  const validation = loginUserSchema.validate(body);
  if (!validation) return response.json({ error: "invalid body" });

  const user: Undefined<User> = database.findOne(USERS_COLLECTION, {
    email: body.email,
  });

  if (!user) return response.json({ error: "invalid credentials" });

  const keyBuffer: Buffer = scryptSync(body.password, HASH_SALT, HASH_LENGTH);
  const passwordBuffer: Buffer = Buffer.from(user.password, HASH_ENCODING);

  const passwordMatch: boolean = timingSafeEqual(keyBuffer, passwordBuffer);

  if (!passwordMatch) return response.json({ error: "invalid credentials" });

  const session: Session = {
    created: new Date().getTime(),
    email: user.email,
    token: randomUUID(),
  };

  database.insertOne(SESSIONS_COLLECTION, session);

  response.json(session);
});

router.post(
  "/register",
  (request: HandlerRequest, response: HandlerResponse) => {
    const body: CreateUser = request.body;
    const createUserSchema = validator.object({
      username: validator.string().min(3).max(30).required(),
      email: validator.string().email().required(),
      password: validator.string().min(8).required(),
    });

    const validation = createUserSchema.validate(body);
    if (!validation) return response.json({ error: "invalid body" });

    if (
      database.findOne(USERS_COLLECTION, { username: body.username }) ||
      database.findOne(USERS_COLLECTION, { email: body.email })
    ) {
      return response.json({ error: "user already exists" });
    }

    const hash: string = scryptSync(
      body.password,
      HASH_SALT,
      HASH_LENGTH,
    ).toString(HASH_ENCODING);

    database.insertOne<User>(USERS_COLLECTION, {
      ...body,
      password: hash,
      created: new Date().getTime(),
      role: Role.USER,
    });
  },
);

export default router;
