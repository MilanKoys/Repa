import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { join } from "path";
import { statSync, readdirSync, readFileSync, Stats } from "fs";

import type {
  HandlerRequest,
  HandlerResponse,
  MiddlewareMethod,
  RouteMap,
  RouteMapMethod,
  RouteMethod,
  Undefined,
} from "@types";

import { basePath, buildRequestBody } from "#helpers";

const HEADERS = {
  contentType: "Content-Type",
};

const CONTENT_TYPES = {
  json: "application/json",
};

export class Api {
  private http: Server;

  protected middlewareSet: Set<MiddlewareMethod> = new Set();

  protected routeMap: RouteMap = {
    GET: new Map(),
    POST: new Map(),
    DELETE: new Map(),
    PUT: new Map(),
  };

  protected dynamicRouteSet: Set<string> = new Set();

  constructor() {
    this.http = createServer(
      (request: IncomingMessage, response: ServerResponse) =>
        this.requestHandler(request, response),
    );
  }

  private async requestHandler(
    request: IncomingMessage,
    response: ServerResponse,
  ) {
    const body: string = await buildRequestBody(request);

    const handlerRequest: HandlerRequest = {
      ...request,
      body,
    };

    const handlerRespsonse: HandlerResponse = {
      write: (data: string) => response.write(data),
      end: () => response.end(),
      json: (object: Object) => {
        response.setHeader(HEADERS.contentType, CONTENT_TYPES.json);
        response.write(JSON.stringify(object));
      },
    };

    const callRoute = (request: HandlerRequest, response: HandlerResponse) => {
      const url: Undefined<string> = request.url;
      if (!url) return response.end();

      const parsedUrl: string[] = url.slice(1).split("/");

      for (const path of this.dynamicRouteSet.keys()) {
        const foundFileContent = this.readFileByUrl(parsedUrl, path);
        if (foundFileContent) {
          response.write(foundFileContent);
        } else {
          const method: Undefined<string> = request.method;
          if (!method) return response.end();
          if (Object.keys(this.routeMap).find((key) => key === method)) {
            const routeMethod: Undefined<RouteMethod> =
              this.routeMap[method as keyof RouteMap].get(url);
            if (!routeMethod) return response.end();
            routeMethod(request, handlerRespsonse);
          }
        }
      }

      response.end();
    };

    const requestStack: RouteMapMethod[] = [...this.middlewareSet, callRoute];

    let stackIndex: number = 0;

    const next = () => {
      const stackMethod = requestStack[stackIndex];
      stackIndex++;
      if (stackMethod) stackMethod(handlerRequest, handlerRespsonse, next);
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
    this.middlewareSet.add(middleware);
  }

  useRouter(route: string, router: Api) {
    for (const key of Object.keys(router.routeMap)) {
      for (const [routeName, method] of router.routeMap[
        key as keyof RouteMap
      ].entries()) {
        const fullRoute: string = join(route, routeName);
        this.routeMap[key as keyof RouteMap].set(fullRoute, method);
      }
    }
  }

  get(route: string, routeMethod: RouteMethod) {
    this.routeMap.GET.set(route, routeMethod);
  }

  post(route: string, routeMethod: RouteMethod) {
    this.routeMap.POST.set(route, routeMethod);
  }

  put(route: string, routeMethod: RouteMethod) {
    this.routeMap.PUT.set(route, routeMethod);
  }

  delete(route: string, routeMethod: RouteMethod) {
    this.routeMap.DELETE.set(route, routeMethod);
  }

  listen(port: number, callback?: () => void) {
    this.http.listen(port, callback);
  }
}
