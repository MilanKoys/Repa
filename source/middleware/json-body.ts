import type { Route, ServerRequest, ServerResponse, VoidMethod } from "@types";

export const jsonBody: Route = (
  request: ServerRequest,
  response: ServerResponse,
  next: VoidMethod,
) => {
  if (typeof request.body !== "string") return next();

  try {
    request.body = JSON.parse(request.body);
    next();
  } catch (error) {
    console.error(error);
    response.outgoingMessage.statusCode = 400;
    response.outgoingMessage.end();
  }
};
