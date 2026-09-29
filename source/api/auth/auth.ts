import { Server } from "#server";

import loginRouter from "./login.js";
import registerRouter from "./register.js";

export const authRouter: Server = new Server();

const authPath = "/auth";

authRouter.join(authPath, registerRouter, loginRouter);

export default authRouter;
