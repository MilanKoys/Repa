import type { VoidMethod } from "@types";
import { Server } from "./server.js";

const PORT: number = 4200;
const LISTEN_MESSAGE: string = `Running on http://localhost:${PORT}`;
const LISTEN_CALLBACK: VoidMethod = () => console.log(LISTEN_MESSAGE);

const server: Server = new Server();

server.listen(PORT, LISTEN_CALLBACK);
