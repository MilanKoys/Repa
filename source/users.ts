import type { HandlerRequest, HandlerResponse } from "@types";

import { Validator } from "./validator.js";
import { Api } from "./api.js";

interface CreateUser {
  username: string;
  email: string;
  password: string;
}

const router = new Api();

const validator = new Validator();

router.post(
  "/register",
  (request: HandlerRequest, response: HandlerResponse) => {
    const body: Partial<CreateUser> = request.body;
    const createUserSchema = validator.object({
      username: validator.string().required(),
      email: validator.string().min(3).required(),
    });

    response.json({ result: createUserSchema.validate(body) });
  },
);

export default router;
