import type { IncomingMessage, ServerResponse } from "http";

import type { VoidMethod } from "@types";
import type { Method } from "#enums";

export type Route = (
  request: IncomingMessage,
  response: ServerResponse,
  next: VoidMethod,
) => void;

export type RouteStack = Route[];

export type MethodMap = Record<string, RouteStack>;

export type RouteMap = Record<Method, MethodMap>;
