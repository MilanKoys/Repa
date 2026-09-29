import type { Route, ServerRequest, ServerResponse, VoidMethod } from "@types";
import { Server } from "#server";
import { Method } from "#enums";
import { dynamicServe, jsonBody, logger } from "#middleware";
import { authRouter } from "#api";
import { Database } from "#database";

const PORT: number = 4200;
const LISTEN_MESSAGE: string = `Running on http://localhost:${PORT}`;
const LISTEN_CALLBACK: VoidMethod = () => console.log(LISTEN_MESSAGE);

const MONGODB_URI: string = "mongodb://127.0.0.1:27017/";
const DATABASE_NAME: string = "repa";
const CONNECTED_MESSAGE: string = `Connected to database ${DATABASE_NAME} on ${MONGODB_URI}`;
const CONNECTED_CALLBACK: VoidMethod = () => console.log(CONNECTED_MESSAGE);

const WEB_PAGES_PATH: string = "web/pages";
const WEB_CODE_PATH: string = "web/code";

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

server.use(logger);
server.use(jsonBody);
server.join(authRouter);
server.use(dynamicServe(WEB_PAGES_PATH));
server.use(dynamicServe(WEB_CODE_PATH));

server.route(Method.Get, HelloWordPath, HelloWorldHandler);
server.join(router);

server.listen(PORT, LISTEN_CALLBACK);
