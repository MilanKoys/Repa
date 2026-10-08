import type {
  DynamicServeOptions,
  Route,
  ServerRequest,
  ServerResponse,
  VoidMethod,
} from "@types";
import { Server } from "#server";
import { Method } from "#enums";
import { dynamicServe, jsonBody, logger } from "#middleware";
import { authRouter, seasonRouter, attendanceRouter } from "#api";
import { Database } from "#database";
import { WebSocket as WebSocketServer } from "./websocket.js";

const WS_PORT: number = 3000;
const WS_LISTEN_MESSAGE: string = `Websocket on http://localhost:${WS_PORT}`;
const WS_LISTEN_CALLBACK: VoidMethod = () => console.log(WS_LISTEN_MESSAGE);

const SERVER_PORT: number = 4200;
const LISTEN_MESSAGE: string = `Running on http://localhost:${SERVER_PORT}`;
const LISTEN_CALLBACK: VoidMethod = () => console.log(LISTEN_MESSAGE);

const MONGODB_URI: string = "mongodb://127.0.0.1:27017/";
const DATABASE_NAME: string = "repa";
const CONNECTED_MESSAGE: string = `Connected to database ${DATABASE_NAME} on ${MONGODB_URI}`;
const CONNECTED_CALLBACK: VoidMethod = () => console.log(CONNECTED_MESSAGE);

const WEB_PAGES_PATH: string = "web/pages";
const WEB_DISTRIBUTION_PATH: string = "web/distribution";
const WEB_STYLES_PATH: string = "web/styles";
const WEB_CODE_PATH: string = "web/code";

const DEFAULT_SERVE_EXTENSION: string = ".html";
const ROOT_FILE_PATH: string = "index.html";
const SERVE_OPTIONS: DynamicServeOptions = {
  appendExtension: DEFAULT_SERVE_EXTENSION,
  rootFilePath: ROOT_FILE_PATH,
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
const webSocketServer: WebSocketServer = new WebSocketServer();

webSocketServer.listen(WS_PORT, WS_LISTEN_CALLBACK);

server.use(jsonBody);
server.use(logger);
server.join(authRouter);
server.join(seasonRouter);
server.join(attendanceRouter);
server.use(dynamicServe(WEB_PAGES_PATH, SERVE_OPTIONS));
server.use(dynamicServe(WEB_DISTRIBUTION_PATH));
server.use(dynamicServe(WEB_STYLES_PATH));
server.use(dynamicServe(WEB_CODE_PATH));

server.route(Method.Get, HelloWordPath, HelloWorldHandler);
server.join(router);

server.listen(SERVER_PORT, LISTEN_CALLBACK);
