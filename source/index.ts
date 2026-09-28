import type {
  Route,
  ServerRequest,
  ServerResponse,
  Undefined,
  VoidMethod,
} from "@types";
import { Server } from "#server";
import { Method } from "#enums";
import { jsonBody } from "#middleware";
import { authRouter } from "#api";
import { Database } from "#database";

const PORT: number = 4200;
const LISTEN_MESSAGE: string = `Running on http://localhost:${PORT}`;
const LISTEN_CALLBACK: VoidMethod = () => console.log(LISTEN_MESSAGE);

const MONGODB_URI: string = "mongodb://127.0.0.1:27017/";
const DATABASE_NAME: string = "repa";
const CONNECTED_MESSAGE: string = `Connected to database ${DATABASE_NAME} on ${MONGODB_URI}`;
const CONNECTED_CALLBACK: VoidMethod = () => console.log(CONNECTED_MESSAGE);

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

const PingPath = "/ping";
const PongHandler: Route = (
  _request: ServerRequest,
  response: ServerResponse,
) => {
  response.outgoingMessage.write("pong");
  response.outgoingMessage.end();
};

const database: Database = Database.init();

database.connect(MONGODB_URI, DATABASE_NAME, CONNECTED_CALLBACK);

const router = new Server();

router.route(Method.Get, PingPath, PongHandler);

const server: Server = new Server();

server.use(jsonBody);
server.use(middleware);
server.join(router);
server.route(Method.Get, HelloWordPath, HelloWorldHandler);

server.join(authRouter);

server.listen(PORT, LISTEN_CALLBACK);
