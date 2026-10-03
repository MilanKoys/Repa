import { Server } from "#server";

import loginRouter from "./login.js";
import registerRouter from "./register.js";
import userProfileRouter from "./user-profile.js";

export const authRouter: Server = new Server();

const authPath = "/auth";

authRouter.join(authPath, registerRouter, loginRouter, userProfileRouter);

export default authRouter;
