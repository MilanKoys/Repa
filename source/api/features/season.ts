import type { Collection, DeleteResult, UpdateResult } from "mongodb";
import type {
  CreateLeaf,
  DeleteLeaf,
  Leaf,
  ServerRequest,
  ServerResponse,
  SetLeaf,
  Undefined,
  User,
} from "@types";

import { Server } from "#server";
import { Collections, Method, ReportStatus, Role } from "#enums";
import { Database } from "#database";
import { UserLibrary } from "#library";
import { Validator } from "#validator";
import { randomUUID } from "crypto";

const VERIFIED_ROLES: Role[] = [Role.Admin, Role.Teacher];

const database: Database = Database.init();
const userLibrary: UserLibrary = UserLibrary.inject();

export const seasonRouter: Server = new Server();

const activePath: string = "/active";
const seasonPath: string = "/season";

const activeSeasonPath: string = `${seasonPath}${activePath}`;

const validator: Validator = new Validator();

const createLeafSchema: Validator = validator.object({
  start: validator.number().required(),
});

const deleteLeafSchema: Validator = validator.object({
  id: validator.string().required(),
});

const setLeafSchema: Validator = validator.object({
  id: validator.string().required(),
  active: validator.boolean().required(),
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

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);

  const season = await seasons.findOne({ active: true });

  response.json({ season });
};

const listSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);

  const seasonList = await seasons.find().toArray();

  response.json(seasonList);
};

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

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);

  const newLeaf: Leaf = {
    id: randomUUID(),
    active: false,
    start: body.start,
  };

  await seasons.insertOne(newLeaf);

  response.json(newLeaf);
};

const deleteSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const body: DeleteLeaf = request.body as DeleteLeaf;

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

  const valid: boolean = deleteLeafSchema.validate(body);

  if (!valid) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);

  const result: DeleteResult = await seasons.deleteOne(body);

  response.json(result);
};

const setSeasonHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const body: SetLeaf = request.body as SetLeaf;

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

  const valid: boolean = setLeafSchema.validate(body);

  if (!valid) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);

  const filter = { id: body.id };
  const update = { $set: { active: body.active } };

  const result: UpdateResult = await seasons.updateOne(filter, update);

  response.json(result);
};

seasonRouter.route(Method.Get, seasonPath, listSeasonHandler);
seasonRouter.route(Method.Post, seasonPath, createSeasonHandler);
seasonRouter.route(Method.Delete, seasonPath, deleteSeasonHandler);
seasonRouter.route(Method.Put, seasonPath, setSeasonHandler);

seasonRouter.route(Method.Get, activeSeasonPath, activeSeasonHandler);
