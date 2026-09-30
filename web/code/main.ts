import { InputTextComponent } from "./components/input-text/input-text.js";
import { ShellComponent } from "./components/shell/shell.js";
import { liveReload } from "./live-reload.js";

const WS_PORT: number = 3000;
const WS_URI: string = `ws://localhost:${WS_PORT}`;

liveReload(WS_URI);

customElements.define("shell-component", ShellComponent);
customElements.define("input-text-component", InputTextComponent);
