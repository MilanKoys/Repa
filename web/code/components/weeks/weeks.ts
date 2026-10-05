import { Component } from "../../component.js";
import { API_URL } from "../../constants/api.js";
import { LeafStatus } from "../leaf/leaf.js";

type Nullable<T> = null | T;
type Undefined<T> = undefined | T;

interface ActiveLeaf {
  season: Nullable<Leaf>;
}

interface Leaf {
  id: string;
  active: boolean;
  start: number;
}

const EMPTY_STRING: string = "";

const CLICK_EVENT: string = "click";

const ACTIVE_SEASON_PATH: string = "/season/active";

const LEAF_COMPONENT_SELECTOR: string = "leaf-component";
const LEAF_WEEK_ATTRIBUTE: string = "week";
const LEAF_STATUS_ATTRIBUTE: string = "status";
const LEAF_ACTIVE_ATTRIBUTE: string = "active";
const LEAF_DATE_ATTRIBUTE: string = "date";
const LEAF_ACTIVE_VALUE: string = "true";
const LEAF_COUNT: number = 16;

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { month: "long" };
const DATE_FORMAT: string = "default";
const MONTH_START: number = 0;
const MONTH_END: number = 3;

const WEEK_ADDED: number = 1;
const WEEK_MILLISECONDS: number = 604800000;
const BASE_COUNT_INDEX: number = 0;

export class WeeksComponent extends Component {
  private weeks: Nullable<HTMLElement> = null;
  private previous: Nullable<HTMLElement> = null;
  private next: Nullable<HTMLElement> = null;

  private leaf: Undefined<ActiveLeaf>;
  private leafStart: Nullable<number> = null;

  constructor() {
    super();
    this.loadTemplate("/components/weeks/weeks.html");
  }

  private getMontName(date: Date) {
    return date.toLocaleString(DATE_FORMAT, DATE_FORMAT_OPTIONS);
  }

  private bindEvents() {
    if (this.previous) {
      this.previous.addEventListener(CLICK_EVENT, async () => {
        const currentDate: number = new Date().getTime();
        const leaf = await this.loadLeaf();
        if (!leaf.season) return;
        const adder: number = WEEK_MILLISECONDS * LEAF_COUNT;
        const startDate: number = this.leafStart ?? leaf.season.start;
        if (leaf.season.start <= startDate - adder) {
          if (!this.leafStart) this.leafStart = startDate;
          this.leafStart -= adder;
          this.renderWeeks();
        }
      });
    }

    if (this.next) {
      this.next.addEventListener(CLICK_EVENT, async () => {
        const currentDate: number = new Date().getTime();
        const leaf = await this.loadLeaf();
        if (!leaf.season) return;
        const adder: number = WEEK_MILLISECONDS * LEAF_COUNT;
        const startDate: number = this.leafStart ?? leaf.season.start;
        if (currentDate > startDate + adder) {
          if (!this.leafStart) this.leafStart = startDate;
          this.leafStart += adder;
          this.renderWeeks();
        }
      });
    }
  }

  protected async templateLoaded() {
    this.weeks = this.document.querySelector("#weeks");
    this.previous = this.document.querySelector("#previous");
    this.next = this.document.querySelector("#next");
    this.renderWeeks();
    this.bindEvents();
  }

  protected renderLeaves(startTime: number) {
    const currentTime: number = new Date().getTime();
    const timeElapsed: number = currentTime - startTime;
    const weekCountBase: number = timeElapsed / WEEK_MILLISECONDS + WEEK_ADDED;
    const weekCount: number = Math.round(weekCountBase);
    const maxCount: number = LEAF_COUNT < weekCount ? LEAF_COUNT : weekCount;

    for (let counter = BASE_COUNT_INDEX; counter < maxCount; counter++) {
      const weekTime: number = startTime + counter * WEEK_MILLISECONDS;
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

  protected async renderWeeks() {
    if (this.weeks) this.weeks.innerHTML = EMPTY_STRING;
    const leaf = await this.loadLeaf();
    if (!leaf.season) return;
    this.renderLeaves(this.leafStart ?? leaf.season.start);
  }

  protected async loadLeaf(): Promise<ActiveLeaf> {
    const leaf: Undefined<ActiveLeaf> = this.leaf;
    if (leaf) return new Promise((resolve) => resolve(leaf));
    const request: Response = await fetch(`${API_URL}${ACTIVE_SEASON_PATH}`);
    const activeSeason: ActiveLeaf = await request.json();
    this.leaf = activeSeason;
    return activeSeason;
  }
}
