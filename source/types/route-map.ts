import type { IncomingMessage, ServerResponse } from "http";

export type MiddlewareMethod = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => void;

export type RouteMethod = (
  request: IncomingMessage,
  response: ServerResponse,
) => void;

export type RouteMapMethod = RouteMethod | MiddlewareMethod;

export interface RouteMap {
  middleware: Set<MiddlewareMethod>;
  get: Map<string, RouteMethod>;
  post: Map<string, RouteMethod>;
  put: Map<string, RouteMethod>;
  delete: Map<string, RouteMethod>;
}
