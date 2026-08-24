import { jsonBody, rootRedirect } from "#middleware";

import { Api } from "./api.js";
import { Database } from "./database.js";
import usersRouter from "./users.js";

const PORT: number = 4200;
const PUBLIC_PATH: string = "/public";

const api: Api = new Api();

const database: Database = new Database();

api.use(rootRedirect);
api.use(jsonBody);

api.useRouter("/users", usersRouter);

api.publicDynamic(PUBLIC_PATH);

api.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));

export function application() {
  return { api, database };
}
