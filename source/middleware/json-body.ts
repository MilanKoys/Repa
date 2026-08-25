import type { HandlerRequest, HandlerResponse } from "@types";

export const jsonBody = (
  request: HandlerRequest,
  response: HandlerResponse,
  next: () => void,
) => {
  try {
    request.body = JSON.parse(request.body);
    next();
  } catch (error) {
    response.status(400);
    response.end();
  }
};
