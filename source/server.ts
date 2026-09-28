import type {
  Server as HttpServer,
  IncomingMessage,
  ServerResponse,
} from "http";
import type {
  Route,
  RouteMap,
  RouteStack,
  Undefined,
  VoidMethod,
} from "@types";

import { createServer as createHttpServer } from "http";
import { Method } from "#enums";

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

  private requestHandler(request: IncomingMessage, response: ServerResponse) {
    const path: Undefined<string> = request.url;
    const method: Undefined<Method> = request.method as Method;

    if (!method || !path) return response.end();

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
