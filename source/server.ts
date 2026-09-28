import type { Server as HttpServer } from "http";
import type { VoidMethod } from "@types";

import { createServer } from "http";

export class Server {
  private readonly server: HttpServer;

  constructor() {
    this.server = createServer();
  }

  public listen(port: number, callback: VoidMethod) {
    this.server.listen(port, () => callback());
  }
}
