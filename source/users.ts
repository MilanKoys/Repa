import type { HandlerRequest, HandlerResponse } from "@types";

import { application } from "./app.js";

export function users() {
  const app = application();

  app.api.post(
    "/register",
    (request: HandlerRequest, response: HandlerResponse) => {
      console.log(request.body);
    },
  );
}
