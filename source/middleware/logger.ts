import type {
  Route,
  ServerRequest,
  ServerResponse,
  Undefined,
  VoidMethod,
} from "@types";

export const logger: Route = (
  request: ServerRequest,
  _response: ServerResponse,
  next: VoidMethod,
) => {
  const method: Undefined<string> = request.incomingMessage.method;
  const url: Undefined<string> = request.incomingMessage.url;

  console.log(`(${new Date().toDateString()}) [${method}]: ${url}`);
  next();
};
