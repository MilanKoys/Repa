import { jsonBody, rootRedirect } from "#middleware";

import { Api } from "./api.js";
import { Database } from "./database.js";
import usersRouter from "./users.js";

const PORT: number = 4200;
const PUBLIC_PATH: string = "/public";

const RUNNING_MESSAGE = `Running on http://localhost:${PORT}`;

const USERS_ROUTE = "/users";

const api: Api = new Api();

api.use(rootRedirect);
api.use(jsonBody);

api.useRouter(USERS_ROUTE, usersRouter);

api.publicDynamic(PUBLIC_PATH);

api.listen(PORT, () => console.log(RUNNING_MESSAGE));
