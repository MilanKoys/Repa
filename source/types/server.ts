import type { Undefined } from "@types";
import type { IncomingMessage, ServerResponse as OutgoingMessage } from "http";

export interface ServerRequest {
  incomingMessage: IncomingMessage;
  body: Undefined<string>;
}

export interface ServerResponse {
  outgoingMessage: OutgoingMessage;
}
