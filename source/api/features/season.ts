import type { Collection } from "mongodb";
import type {
  CreateLeaf,
  Leaf,
  ServerRequest,
  ServerResponse,
  Undefined,
  User,
} from "@types";

import { Server } from "#server";
import { CollectionName, Method, Role } from "#enums";
import { Database } from "#database";
import { UserLibrary } from "#library";
import { Validator } from "#validator";

const VERIFIED_ROLES: Role[] = [Role.Admin, Role.Teacher];

const database: Database = Database.init();
const userLibrary: UserLibrary = UserLibrary.inject();

const seasonRouter: Server = new Server();

const activePath: string = "/active";
const seasonPath: string = "/season";

const activeSeasonPath: string = `${seasonPath}${activePath}`;

const validator: Validator = new Validator();

const createLeafSchema: Validator = validator.object({
  start: validator.number().required(),
});

const activeSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(CollectionName.Seasons);

  const season = await seasons.findOne({ active: true });

  response.json({ season });
};

const listSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {};

const createSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const body: CreateLeaf = request.body as CreateLeaf;

  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  if (!userLibrary.verifyRoles(user, VERIFIED_ROLES)) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const valid: boolean = createLeafSchema.validate(body);

  if (!valid) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(CollectionName.Seasons);

  const newLeaf: Leaf = {
    active: false,
    start: body.start,
  };

  await seasons.insertOne(newLeaf);

  response.json(newLeaf);
};

const deleteSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {};

const setSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {};

seasonRouter.route(Method.Get, seasonPath, listSeasonHandler);
seasonRouter.route(Method.Post, seasonPath, createSeasonHandler);
seasonRouter.route(Method.Delete, seasonPath, deleteSeasonHandler);
seasonRouter.route(Method.Put, seasonPath, setSeasonHandler);

seasonRouter.route(Method.Get, activeSeasonPath, activeSeasonHandler);

export default seasonRouter;
