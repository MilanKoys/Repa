import type {
  KeyPairExportOptions,
  PrivateKeyExportOptions,
  PublicKeyExportOptions,
} from "crypto";
import type { Collection } from "mongodb";

import type {
  UserBase,
  ServerRequest,
  ServerResponse,
  User,
  UserSessionKeys,
  UserRegister,
} from "@types";

import { generateKeyPairSync, scryptSync } from "crypto";

import { Server } from "#server";
import { Collections, Method, Role } from "#enums";
import { Validator } from "#validator";
import { Database } from "#database";

const SALT_LENGTH: number = 32;
const HASH_LENGTH: number = 64;
const SALT: Uint8Array = new Uint8Array(SALT_LENGTH);
const HASH_ENCODING: "hex" = "hex";
const KEY_PAIR_ALGORITHM: "ed25519" = "ed25519";
const KEY_PAIR_ENCODING: BufferEncoding = "base64";

const PUBLIC_KEY_ENCODING: PublicKeyExportOptions<"spki"> = {
  type: "spki",
  format: "pem",
};

const PRIVATE_KEY_ENCODING: PrivateKeyExportOptions<"pkcs8"> = {
  type: "pkcs8",
  format: "pem",
};

const KEY_PAIR_OPTIONS: KeyPairExportOptions<"spki", "pkcs8"> = {
  privateKeyEncoding: PRIVATE_KEY_ENCODING,
  publicKeyEncoding: PUBLIC_KEY_ENCODING,
};

function hashPassword(password: string) {
  return scryptSync(password, SALT, HASH_LENGTH).toString(HASH_ENCODING);
}

function generateKeys(encoding: BufferEncoding): UserSessionKeys {
  const keyPair: UserSessionKeys = generateKeyPairSync(
    KEY_PAIR_ALGORITHM,
    KEY_PAIR_OPTIONS,
  );

  keyPair.privateKey = Buffer.from(keyPair.privateKey).toString(encoding);
  keyPair.publicKey = Buffer.from(keyPair.publicKey).toString(encoding);

  return keyPair;
}

const validator: Validator = new Validator();

const registerSchema: Validator = validator.object({
  email: validator.string().required().min(3).max(128),
  password: validator.string().required().min(8),
  firstName: validator.string().required().min(3),
  surName: validator.string().required().min(3),
  class: validator.number().min(1).max(3),
});

const database: Database = Database.init();

const registerRouter: Server = new Server();

const registerPath = "/register";
const registerHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const body: UserRegister = request.body as UserRegister;

  const valid: boolean = registerSchema.validate(body);

  if (!valid) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const users: Collection<User> = database.collection(Collections.Users);

  const foundUser = await users.findOne({ email: body.email });

  if (foundUser) {
    response.outgoingMessage.statusCode = 400;
    return response.json({ error: "Email already registred" });
  }

  const hash: string = hashPassword(body.password);

  await users.insertOne({
    ...body,
    role: Role.Student,
    session: generateKeys(KEY_PAIR_ENCODING),
    password: hash,
    created: new Date().getTime(),
  });

  response.outgoingMessage.end();
};

registerRouter.route(Method.Post, registerPath, registerHandler);

export default registerRouter;
