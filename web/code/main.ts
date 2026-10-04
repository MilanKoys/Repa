import { CalendarComponent } from "./components/calendar/calendar.js";
import { HeaderComponent } from "./components/header/header.js";
import { HeroComponent } from "./components/hero/hero.js";
import { InputTextComponent } from "./components/input-text/input-text.js";
import { ShellComponent } from "./components/shell/shell.js";
import { liveReload } from "./live-reload.js";

const WS_PORT: number = 3000;
const WS_URI: string = `ws://localhost:${WS_PORT}`;

liveReload(WS_URI);

customElements.define("shell-component", ShellComponent);
customElements.define("header-component", HeaderComponent);
customElements.define("input-text-component", InputTextComponent);
customElements.define("hero-component", HeroComponent);
customElements.define("calendar-component", CalendarComponent);
