import type { ServerRequest, ServerResponse, Undefined, User } from "@types";

import { Server } from "#server";
import { Method } from "#enums";
import { UserLibrary } from "#library";

const userLibrary: UserLibrary = UserLibrary.inject();

const userProfileRouter: Server = new Server();

const userProfilePath = "/user-profile";
const userProfileHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  response.json({
    firstName: user.firstName,
    surName: user.surName,
    email: user.email,
  });
};

userProfileRouter.route(Method.Get, userProfilePath, userProfileHandler);

export default userProfileRouter;
