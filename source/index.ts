import type {
  Route,
  ServerRequest,
  ServerResponse,
  Undefined,
  VoidMethod,
} from "@types";
import { Server } from "./server.js";
import { Method } from "#enums";

const PORT: number = 4200;
const LISTEN_MESSAGE: string = `Running on http://localhost:${PORT}`;
const LISTEN_CALLBACK: VoidMethod = () => console.log(LISTEN_MESSAGE);

const middleware: Route = (
  request: ServerRequest,
  _response: ServerResponse,
  next: VoidMethod,
) => {
  const method: Undefined<string> = request.incomingMessage.method;
  const url: Undefined<string> = request.incomingMessage.url;

  console.log(`(${new Date().toDateString()}) [${method}]: ${url}`);
  next();
};

const HelloWordPath: string = "/";
const HelloWorldHandler: Route = (
  request: ServerRequest,
  response: ServerResponse,
) => {
  response.outgoingMessage.write("Hello World");
  response.outgoingMessage.end();
};

const server: Server = new Server();

server.use(middleware);
server.route(Method.Get, HelloWordPath, HelloWorldHandler);

server.listen(PORT, LISTEN_CALLBACK);
