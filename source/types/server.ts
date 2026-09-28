import type { IncomingMessage, ServerResponse as OutgoingMessage } from "http";

export interface ServerRequest {
  incomingMessage: IncomingMessage;
  body: unknown;
}

export interface ServerResponse {
  outgoingMessage: OutgoingMessage;
  json: (object: Object) => void;
}
