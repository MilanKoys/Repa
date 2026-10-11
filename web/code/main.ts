import { WeeksComponent } from "./components/weeks/weeks.js";
import { HeaderComponent } from "./components/header/header.js";
import { HeroComponent } from "./components/hero/hero.js";
import { InputTextComponent } from "./components/input-text/input-text.js";
import { ShellComponent } from "./components/shell/shell.js";
import { liveReload } from "./live-reload.js";
import { LeafComponent } from "./components/leaf/leaf.js";
import { RecordComponent } from "./components/record/record.js";
import { DashboardComponent } from "./components/dashboard/dashboard.js";
import { DetailComponent } from "./components/detail/detail.js";
import { EntryComponent } from "./components/entry/entry.js";
import { StatisticsComponent } from "./components/statistics/statistics.js";
import { StatisticComponent } from "./components/statistic/statistic.js";
import { MenuComponent } from "./components/menu/menu.js";
import { MenuItemComponent } from "./components/menu-item/menu-item.js";
import { UserListComponent } from "./components/user-list/user-list.js";

const WS_PORT: number = 3000;
const WS_URI: string = `ws://localhost:${WS_PORT}`;

liveReload(WS_URI);

customElements.define("shell-component", ShellComponent);
customElements.define("header-component", HeaderComponent);
customElements.define("input-text-component", InputTextComponent);
customElements.define("hero-component", HeroComponent);
customElements.define("weeks-component", WeeksComponent);
customElements.define("leaf-component", LeafComponent);
customElements.define("record-component", RecordComponent);
customElements.define("dashboard-component", DashboardComponent);
customElements.define("detail-component", DetailComponent);
customElements.define("entry-component", EntryComponent);
customElements.define("statistics-component", StatisticsComponent);
customElements.define("statistic-component", StatisticComponent);
customElements.define("menu-component", MenuComponent);
customElements.define("menu-item-component", MenuItemComponent);
customElements.define("user-list-component", UserListComponent);
