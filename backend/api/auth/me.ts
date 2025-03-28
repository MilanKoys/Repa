import { db } from "../../database";
import { userFromToken } from "../../functions";
import express from "express";

export const meRouter = express.Router();

const database = db();

meRouter.get("/me", async (req, res) => {
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
