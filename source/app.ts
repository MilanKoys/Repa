import type { IncomingMessage, ServerResponse } from "http";

import { Api } from "./api.js";

const PORT: number = 4200;
const ROOT_URL: string = "/";
const ROOT_FILE: string = "/index.html";
const PUBLIC_PATH: string = "/public";

const rootRedirect = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => {
  if (request.url === ROOT_URL) {
    request.url = ROOT_FILE;
  }

  next();
};

const api: Api = new Api();

api.use(rootRedirect);

api.publicDynamic(PUBLIC_PATH);

api.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
