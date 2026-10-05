import { Component } from "../../component.js";
import { API_URL } from "../../constants/api.js";
import { LeafStatus } from "../leaf/leaf.js";

type Nullable<T> = null | T;

interface ActiveLeaf {
  season: Nullable<Leaf>;
}

interface Leaf {
  id: string;
  active: boolean;
  start: number;
}

const ACTIVE_SEASON_PATH: string = "/season/active";

const LEAF_COMPONENT_SELECTOR: string = "leaf-component";
const LEAF_WEEK_ATTRIBUTE: string = "week";
const LEAF_STATUS_ATTRIBUTE: string = "status";
const LEAF_ACTIVE_ATTRIBUTE: string = "active";
const LEAF_DATE_ATTRIBUTE: string = "date";
const LEAF_ACTIVE_VALUE: string = "true";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { month: "long" };
const DATE_FORMAT: string = "default";
const MONTH_START: number = 0;
const MONTH_END: number = 3;

const WEEK_ADDED: number = 1;
const WEEK_MILLISECONDS: number = 604800000;
const BASE_COUNT_INDEX: number = 0;

export class WeeksComponent extends Component {
  private weeks: HTMLElement | null = null;

  constructor() {
    super();
    this.loadTemplate("/components/weeks/weeks.html");
  }

  private getMontName(date: Date) {
    return date.toLocaleString(DATE_FORMAT, DATE_FORMAT_OPTIONS);
  }

  protected async templateLoaded() {
    this.weeks = this.document.querySelector("#weeks");
    this.renderWeeks();
  }

  protected async renderWeeks() {
    const leaf = await this.loadLeaf();
    if (!leaf.season) return;

    const currentTime: number = new Date().getTime();
    const timeElapsed: number = currentTime - leaf.season.start;
    const weekCountBase: number = timeElapsed / WEEK_MILLISECONDS + WEEK_ADDED;
    const weekCount: number = Math.round(weekCountBase);

    for (let counter = BASE_COUNT_INDEX; counter < weekCount; counter++) {
      const weekTime: number = leaf.season.start + counter * WEEK_MILLISECONDS;
      const weekDate: Date = new Date(weekTime);
      const weekMonth: string = this.getMontName(weekDate);
      const weekMonthSlice: string = weekMonth.slice(MONTH_START, MONTH_END);
      const weekDateString: string = `${weekDate.getDate()} ${weekMonthSlice}`;
      const leafElement = document.createElement(LEAF_COMPONENT_SELECTOR);

      if (counter == weekCount - WEEK_ADDED) {
        leafElement.setAttribute(LEAF_ACTIVE_ATTRIBUTE, LEAF_ACTIVE_VALUE);
      }

      leafElement.setAttribute(LEAF_WEEK_ATTRIBUTE, `W${counter + WEEK_ADDED}`);
      leafElement.setAttribute(LEAF_DATE_ATTRIBUTE, `${weekDateString}`);

      if (this.weeks) this.weeks.appendChild(leafElement);
    }
  }

  protected async loadLeaf(): Promise<ActiveLeaf> {
    const request: Response = await fetch(`${API_URL}${ACTIVE_SEASON_PATH}`);
    const activeSeason: ActiveLeaf = await request.json();
    return activeSeason;
  }
}
