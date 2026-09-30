import type { Or, Undefined, VoidMethod } from "@types";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type { Hash } from "crypto";

import { createHash } from "crypto";
import { createServer as createHttpServer } from "http";

const WS_UPGRADE: string = "websocket";
const UPGRADE_HEADER: string = "Upgrade";
const CONNECTION_HEADER: string = "Connection";
const SEC_WS_ACCEPT_HEADER: string = "Sec-WebSocket-Accept";
const SEC_WS_KEY_HEADER: string = "sec-websocket-key";
const MAGIC_STRING_KEY: string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const HASH_ALHORITHM: string = "sha1";
const HASH_DIGEST: BufferEncoding = "base64";

export class WebSocket {
  private readonly server: Server = this.createServer();

  private createServer(): Server {
    return createHttpServer((request, response) => {
      return this.requestHandler(request, response);
    });
  }

  private requestHandler(request: IncomingMessage, response: ServerResponse) {
    if (request.headers.upgrade !== WS_UPGRADE) return response.end();

    const webSocketKey = request.headers[SEC_WS_KEY_HEADER];

    if (!webSocketKey || Array.isArray(webSocketKey)) {
      return response.end();
    }

    const keyConcat: string = webSocketKey + MAGIC_STRING_KEY;
    const shasum: Hash = createHash(HASH_ALHORITHM);

    shasum.update(keyConcat);

    const newKey: string = shasum.digest(HASH_DIGEST);

    response.setHeader(UPGRADE_HEADER, WS_UPGRADE);
    response.setHeader(CONNECTION_HEADER, UPGRADE_HEADER);
    response.setHeader(SEC_WS_ACCEPT_HEADER, newKey);
  }

  public listen(port: number, callback?: VoidMethod) {
    this.server.listen(port, callback);
  }

  public close(callback?: () => void) {
    this.server.close(callback);
  }
}
