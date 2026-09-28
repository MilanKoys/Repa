import type { Route, Undefined, VoidMethod } from "@types";
import { Server } from "./server.js";
import { Method } from "#enums";
import type { IncomingMessage, ServerResponse } from "http";

const PORT: number = 4200;
const LISTEN_MESSAGE: string = `Running on http://localhost:${PORT}`;
const LISTEN_CALLBACK: VoidMethod = () => console.log(LISTEN_MESSAGE);

const middleware: Route = (
  request: IncomingMessage,
  _response: ServerResponse,
  next: VoidMethod,
) => {
  const method: Undefined<string> = request.method;
  const url: Undefined<string> = request.url;

  console.log(`(${new Date().toDateString()}) [${method}]: ${url}`);
  next();
};

const HelloWordPath: string = "/";
const HelloWorldHandler: Route = (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  response.write("Hello World");
  response.end();
};

const server: Server = new Server();

server.use(middleware);
server.route(Method.Get, HelloWordPath, HelloWorldHandler);

server.listen(PORT, LISTEN_CALLBACK);
