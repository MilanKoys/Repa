import type { ServerRequest, ServerResponse, VoidMethod } from "@types";
import type { Method } from "#enums";

export type Route = (
  request: ServerRequest,
  response: ServerResponse,
  next: VoidMethod,
) => void;

export type RouteStack = Route[];

export type MethodMap = Record<string, RouteStack>;

export type RouteMap = Record<Method, MethodMap>;

export type ItterateRouteMapCallback = (method: Method, path: string) => void;
