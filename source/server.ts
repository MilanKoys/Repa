import type {
  IncomingMessage,
  Server as HttpServer,
  ServerResponse as OutgoingMessage,
} from "http";
import type {
  Route,
  RouteMap,
  RouteStack,
  ServerRequest,
  ServerResponse,
  Undefined,
  VoidMethod,
} from "@types";

import { createServer as createHttpServer } from "http";
import { IncomingMessageEvent, Method } from "#enums";

const EMPTY_STRING: string = "";

export class Server {
  private readonly server: HttpServer = this.createServer();
  private readonly routeMap: RouteMap = this.buildRouteMap();
  private readonly middlewareStack: RouteStack = [];

  private buildRouteMap(): RouteMap {
    return {
      DELETE: {},
      GET: {},
      POST: {},
      PUT: {},
    };
  }

  private createServer(): HttpServer {
    return createHttpServer((request, response) => {
      return this.requestHandler(request, response);
    });
  }

  private getHandlers(method: Method, path: string): RouteStack {
    return this.routeMap[method][path] ?? [];
  }

  private pushHandlers(method: Method, path: string, handlers: RouteStack) {
    const routes: RouteStack = this.getHandlers(method, path);
    routes.push(...handlers);
    this.routeMap[method][path] = routes;
  }

  private createResponse(outgoingMessage: OutgoingMessage): ServerResponse {
    return { outgoingMessage };
  }

  private createRequest(
    incomingMessage: IncomingMessage,
    body: Undefined<string>,
  ): ServerRequest {
    return { incomingMessage, body };
  }

  private async buildBody(request: IncomingMessage): Promise<string> {
    return new Promise<string>((resolve) => {
      const blob: string[] = [];

      const resolveBlob: VoidMethod = () => {
        if (!blob.length) return resolve(EMPTY_STRING);
        resolve(blob.toString());
      };

      request.on(IncomingMessageEvent.Data, (chunk) => blob.push(chunk));
      request.on(IncomingMessageEvent.End, () => resolveBlob());
    });
  }

  private async requestHandler(
    incomingMessage: IncomingMessage,
    outgoingMessage: OutgoingMessage,
  ) {
    const path: Undefined<string> = incomingMessage.url;
    const method: Undefined<Method> = incomingMessage.method as Method;

    if (!method || !path) return outgoingMessage.end();

    const body: Undefined<string> = await this.buildBody(incomingMessage);

    const request: ServerRequest = this.createRequest(incomingMessage, body);
    const response: ServerResponse = this.createResponse(outgoingMessage);

    const routeStack: RouteStack = this.getHandlers(method, path);
    const stack: RouteStack = [...this.middlewareStack, ...routeStack];

    let stackPointer: number = 0;

    const next = () => {
      const handler: Undefined<Route> = stack[stackPointer];
      stackPointer++;
      if (handler) handler(request, response, next);
    };

    next();
  }

  public use(...handlers: RouteStack) {
    this.middlewareStack.push(...handlers);
  }

  public routeAll(path: string, ...handlers: RouteStack) {
    Object.values(Method).forEach((method: Method) => {
      this.pushHandlers(method, path, handlers);
    });
  }

  public route(method: Method, path: string, ...handlers: RouteStack) {
    this.pushHandlers(method, path, handlers);
  }

  public listen(port: number, callback?: VoidMethod) {
    this.server.listen(port, callback);
  }
}
