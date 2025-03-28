import { userFromToken } from "../../functions";
import express from "express";

export const meRouter = express.Router();

meRouter.get("/", async (req, res) => {
  const user = await userFromToken(req.headers.authorization);

  if (!user) {
    res.status(403);
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    created: user.created,
  });
});
