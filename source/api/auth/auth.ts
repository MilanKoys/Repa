import { Server } from "#server";

import registerRouter from "./register.js";

export const authRouter: Server = new Server();

const authPath = "/auth";

authRouter.join(authPath, registerRouter);

export default authRouter;
