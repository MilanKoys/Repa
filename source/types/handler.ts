import type { IncomingMessage } from "http";

export interface HandlerResponse {
  write: (data: string) => void;
  json: (object: Object) => void;
  status: (statusCode: number) => void;
  end: () => void;
}

export type HandlerRequest = Partial<IncomingMessage> & { body: any };
