import type { CreateUser, ServerRequest, ServerResponse, User } from "@types";

import { scryptSync } from "node:crypto";

import { Server } from "#server";
import { Method } from "#enums";
import { Validator } from "#validator";
import { Database } from "../../database.js";
import type { Collection } from "mongodb";

const USERS_COLLECTION: string = "users";
const SALT_LENGTH: number = 32;
const HASH_LENGTH: number = 64;
const SALT: Uint8Array = new Uint8Array(SALT_LENGTH);
const HASH_ENCODING: "hex" = "hex";

function hashPassword(password: string) {
  return scryptSync(password, SALT, HASH_LENGTH).toString(HASH_ENCODING);
}

const validator: Validator = new Validator();

const registerSchema: Validator = validator.object({
  email: validator.string().required().min(3).max(128),
  password: validator.string().required().min(8),
});

const registerRouter: Server = new Server();

const database: Database = Database.init();

const registerPath = "/register";
const registerHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const body: CreateUser = request.body as CreateUser;

  const valid: boolean = registerSchema.validate(body);

  if (!valid) {
    response.outgoingMessage.statusCode = 400;
    response.outgoingMessage.end();
  }

  const users: Collection<User> = database.collection(USERS_COLLECTION);

  const foundUser = await users.findOne({ email: body.email });

  if (foundUser) {
    response.outgoingMessage.statusCode = 400;
    return response.json({ error: "Email already registred" });
  }

  const hash: string = hashPassword(body.password);

  await users.insertOne({
    ...body,
    password: hash,
    created: new Date().getTime(),
  });

  response.outgoingMessage.end();
};

registerRouter.route(Method.Post, registerPath, registerHandler);

export default registerRouter;
