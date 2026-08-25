import { scryptSync } from "crypto";
import type { HandlerRequest, HandlerResponse } from "@types";

import { Validator } from "./validator.js";
import { Api } from "./api.js";
import { database } from "./database.js";

interface CreateUser {
  username: string;
  email: string;
  password: string;
}

const USERS_COLLECTION: string = "users";

const HASH_LENGTH: number = 10;
const HASH_ENCODING: "hex" = "hex";
const HASH_SALT: string = "salt";

const router = new Api();

const validator = new Validator();

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

    const passwordHash = scryptSync(
      body.password,
      HASH_SALT,
      HASH_LENGTH,
    ).toString(HASH_ENCODING);

    database.insertOne(USERS_COLLECTION, {
      ...body,
      password: passwordHash,
    });
  },
);

export default router;
