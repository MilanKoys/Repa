import type {
  UserBase,
  ServerRequest,
  ServerResponse,
  User,
  Token,
} from "@types";
import type { Collection } from "mongodb";

import { scryptSync } from "node:crypto";

import { Server } from "#server";
import { CollectionName, Method } from "#enums";
import { Validator } from "#validator";
import { Database } from "#database";
import { Session } from "#session";

const SALT_LENGTH: number = 32;
const HASH_LENGTH: number = 64;
const SALT: Uint8Array = new Uint8Array(SALT_LENGTH);
const HASH_ENCODING: "hex" = "hex";

function hashPassword(password: string) {
  return scryptSync(password, SALT, HASH_LENGTH).toString(HASH_ENCODING);
}

const validator: Validator = new Validator();

const loginSchema: Validator = validator.object({
  email: validator.string().required().min(3).max(128),
  password: validator.string().required().min(8),
});

const database: Database = Database.init();
const session: Session = Session.init();

const loginRouter: Server = new Server();

const loginPath = "/login";
const loginHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const body: UserBase = request.body as UserBase;

  const valid: boolean = loginSchema.validate(body);

  if (!valid) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const users: Collection<User> = database.collection(CollectionName.Users);

  const foundUser = await users.findOne({ email: body.email });

  if (!foundUser) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const hash: string = hashPassword(body.password);

  if (hash !== foundUser.password) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const token: Token = session.createSession(foundUser);

  response.json(token);
};

loginRouter.route(Method.Post, loginPath, loginHandler);

export default loginRouter;
