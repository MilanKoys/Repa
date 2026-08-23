import type { IncomingMessage } from "http";

import type { HandlerRequest, HandlerResponse } from "@types";

import { Api } from "./api.js";
import { Database } from "./database.js";
import { users } from "./users.js";

const PORT: number = 4200;
const ROOT_URL: string = "/";
const ROOT_FILE: string = "/index.html";
const PUBLIC_PATH: string = "/public";

const rootRedirect = (
  request: HandlerRequest,
  _response: HandlerResponse,
  next: () => void,
) => {
  if (request.url === ROOT_URL) {
    request.url = ROOT_FILE;
  }

  next();
};

const api: Api = new Api();

const database: Database = new Database();

api.use(rootRedirect);

users();

api.publicDynamic(PUBLIC_PATH);

api.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));

export function application() {
  return { api, database };
}
