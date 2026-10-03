import type { Collection } from "mongodb";
import type {
  ServerRequest,
  ServerResponse,
  Token,
  Undefined,
  User,
} from "@types";

import { Server } from "#server";
import { CollectionName, Method } from "#enums";
import { Database } from "#database";
import { Session } from "#session";

const database: Database = Database.init();
const session: Session = Session.init();

const userProfileRouter: Server = new Server();

const userProfilePath = "/user-profile";
const userProfileHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const cookies = request.incomingMessage.headers.cookie;

  if (!cookies) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const sessionToken: Undefined<Token> = session.parseSessionCookie(cookies);

  if (!sessionToken) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const users: Collection<User> = database.collection(CollectionName.Users);

  const foundUser = await users.findOne({ email: sessionToken.email });

  if (!foundUser) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const verify = session.verifySession(foundUser, sessionToken);

  if (!verify) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  response.json({
    firstName: foundUser.firstName,
    surName: foundUser.surName,
    email: foundUser.email,
  });
};

userProfileRouter.route(Method.Get, userProfilePath, userProfileHandler);

export default userProfileRouter;
