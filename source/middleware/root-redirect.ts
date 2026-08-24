import type { HandlerRequest, HandlerResponse } from "@types";

const ROOT_URL: string = "/";
const ROOT_FILE: string = "/index.html";

export const rootRedirect = (
  request: HandlerRequest,
  _response: HandlerResponse,
  next: () => void,
) => {
  if (request.url === ROOT_URL) {
    request.url = ROOT_FILE;
  }

  next();
};
