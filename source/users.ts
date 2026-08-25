import { scryptSync, timingSafeEqual, randomUUID } from "crypto";

import type {
  CreateUser,
  HandlerRequest,
  HandlerResponse,
  LoginUser,
  Undefined,
  User,
} from "@types";

import { Validator } from "./validator.js";
import { Api } from "./api.js";
import { database } from "./database.js";

interface Session {
  token: string;
  created: number;
  email: string;
}

const USERS_COLLECTION: string = "users";
const SESSIONS_COLLECTION: string = "sessions";

const HASH_LENGTH: number = 10;
const HASH_ENCODING: "hex" = "hex";
const HASH_SALT: string = "salt";

const router = new Api();

const validator = new Validator();

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
    });
  },
);

export default router;
