import type { HandlerRequest, HandlerResponse } from "@types";

export const jsonBody = (
  request: HandlerRequest,
  response: HandlerResponse,
  next: () => void,
) => {
  if (!request.body) return next();

  try {
    request.body = JSON.parse(request.body);
    next();
  } catch (error) {
    response.status(400);
    response.end();
  }
};
