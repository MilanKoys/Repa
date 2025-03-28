import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import { config } from "./config";

import { authRouter, seasonRouter, userRouter } from "./api";

const app = express();
const port = config?.port ?? 4000;

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("tiny"));

app.use("/auth", authRouter);
app.use("/season", seasonRouter);
app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello world!" });
});

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
