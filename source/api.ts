import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { join } from "path";
import { statSync, readdirSync, readFileSync, Stats } from "fs";

import type {
  MiddlewareMethod,
  RouteMap,
  RouteMapMethod,
  Undefined,
} from "@types";
import { basePath } from "#helpers";

export class Api {
  private http: Server;

  private routeMap: RouteMap = {
    middleware: new Set(),
    get: new Map(),
    post: new Map(),
    delete: new Map(),
    put: new Map(),
  };

  private dynamicRouteSet: Set<string> = new Set();

  constructor() {
    this.http = createServer(
      (request: IncomingMessage, response: ServerResponse) =>
        this.requestHandler(request, response),
    );
  }

  private requestHandler(request: IncomingMessage, response: ServerResponse) {
    const callRoute = (request: IncomingMessage, response: ServerResponse) => {
      const url: Undefined<string> = request.url;
      if (!url) return response.end();

      const parsedUrl: string[] = url.slice(1).split("/");

      for (const path of this.dynamicRouteSet.keys()) {
        const foundFileContent = this.readFileByUrl(parsedUrl, path);
        if (foundFileContent) response.write(foundFileContent);
      }

      response.end();
    };

    const requestStack: RouteMapMethod[] = [
      ...this.routeMap.middleware,
      callRoute,
    ];

    let stackIndex: number = 0;

    const next = () => {
      const stackMethod = requestStack[stackIndex];
      stackIndex++;
      if (stackMethod) stackMethod(request, response, next);
    };

    next();
  }

  private readFileByUrl(url: string[], path: string): Undefined<string> {
    const systemPath: string = join(basePath(), path);

    const pathStat: Stats = statSync(systemPath);

    if (pathStat.isDirectory()) {
      const dirContent: string[] = readdirSync(systemPath);

      if (dirContent.find((item) => item === url[0])) {
        if (url.length == 1) {
          const fileName: Undefined<string> = url[0];
          if (!fileName) return;

          const newPath: string = join(basePath(), path, fileName);
          const fileContent = readFileSync(newPath, "utf-8");
          return fileContent;
        } else {
          const nextName: Undefined<string> = url[0];
          if (!nextName) return;
          return this.readFileByUrl(url.slice(1), join(path, nextName));
        }
      }
    }
  }

  publicDynamic(path: string) {
    this.dynamicRouteSet.add(path);
  }

  use(middleware: MiddlewareMethod) {
    this.routeMap.middleware.add(middleware);
  }

  listen(port: number, callback?: () => void) {
    this.http.listen(port, callback);
  }
}
