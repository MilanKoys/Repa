import type { IncomingMessage } from "http";

import type { HandlerRequest, HandlerResponse } from "./handler.js";

export type MiddlewareMethod = (
  request: HandlerRequest,
  response: HandlerResponse,
  next: () => void,
) => void;

export type RouteMethod = (
  request: HandlerRequest,
  response: HandlerResponse,
) => void;

export type RouteMapMethod = RouteMethod | MiddlewareMethod;

export interface RouteMap {
  GET: Map<string, RouteMethod>;
  POST: Map<string, RouteMethod>;
  PUT: Map<string, RouteMethod>;
  DELETE: Map<string, RouteMethod>;
}
