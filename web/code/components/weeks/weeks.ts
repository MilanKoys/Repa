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

const ZERO: number = 0;
const ONE: number = 1;
const EMPTY_STRING: string = "";

const CLICK_EVENT: string = "click";

const ACTIVE_SEASON_PATH: string = "/season/active";

const HIDDEN_CLASS: string = "hidden";

const DISABLE_ACTION_OPACITY_CLASS: string = "opacity-50";
const ENABLED_ACTION_CURSOR_CLASS: string = "cursor-pointer";
const ENABLED_ACTION_HOVER_BACKGROUND: string = "hover:bg-slate-100";

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
  private last: Nullable<HTMLElement> = null;

  private page: number = 0;
  private leaf: Undefined<ActiveLeaf>;
  private leafStart: Nullable<number> = null;

  constructor() {
    super();
    this.loadTemplate("/components/weeks/weeks.html");
  }

  private getMontName(date: Date) {
    return date.toLocaleString(DATE_FORMAT, DATE_FORMAT_OPTIONS);
  }

  private async calculateActions() {
    const leaf = await this.loadLeaf();
    if (!leaf.season) return;
    const leafStart: number = leaf.season.start;
    const adder: number = WEEK_MILLISECONDS * LEAF_COUNT;
    const startDate: number = this.leafStart ?? leaf.season.start;

    return { adder, startDate, leafStart };
  }

  private toggleActionClass(element: HTMLElement, toggle: boolean) {
    if (toggle) {
      element.classList.remove(DISABLE_ACTION_OPACITY_CLASS);
      element.classList.add(ENABLED_ACTION_CURSOR_CLASS);
      element.classList.add(ENABLED_ACTION_HOVER_BACKGROUND);
    } else {
      element.classList.add(DISABLE_ACTION_OPACITY_CLASS);
      element.classList.remove(ENABLED_ACTION_CURSOR_CLASS);
      element.classList.remove(ENABLED_ACTION_HOVER_BACKGROUND);
    }
  }

  private executeEvent(adder: number, startDate: number) {
    if (!this.leafStart) this.leafStart = startDate;
    this.page += Math.sign(adder);
    this.leafStart += adder;
    this.renderWeeks();
    this.disableEvents();
  }

  private async calculatePrevious() {
    const dates = await this.calculateActions();
    let toggle: boolean = false;
    if (!dates) {
      return { toggle, adder: ZERO, startDate: ZERO, leafStart: ZERO };
    }

    const { adder, startDate, leafStart } = dates;
    toggle = leafStart <= startDate - adder;
    return { toggle, adder, startDate, leafStart };
  }

  private async calculateNext() {
    const dates = await this.calculateActions();
    let toggle: boolean = false;
    if (!dates) {
      return { toggle, adder: ZERO, startDate: ZERO };
    }

    const currentDate: number = new Date().getTime();
    const { adder, startDate, leafStart } = dates;
    toggle = currentDate > startDate + adder;
    return { toggle, adder, startDate, leafStart };
  }

  private async executeNext() {
    const { toggle, adder, startDate } = await this.calculateNext();
    if (toggle) {
      this.executeEvent(adder, startDate);
    }

    return toggle;
  }

  private async executePrevious() {
    const { adder, startDate, toggle } = await this.calculatePrevious();
    if (toggle) {
      this.executeEvent(-adder, startDate);
    }
  }

  private bindEvents() {
    this.disableEvents();

    if (this.previous) {
      this.previous.addEventListener(CLICK_EVENT, () => this.executePrevious());
    }

    if (this.next) {
      this.next.addEventListener(CLICK_EVENT, () => this.executeNext());
    }

    if (this.last) {
      this.last.addEventListener(CLICK_EVENT, () => this.scrollLast());
    }
  }

  private renderLastAction(toggle: boolean) {
    if (this.last) {
      if (!toggle) {
        this.last.classList.add(HIDDEN_CLASS);
      } else {
        this.last.classList.remove(HIDDEN_CLASS);
      }
    }
  }

  private async disableEvents() {
    if (this.previous) {
      const { toggle } = await this.calculatePrevious();
      this.toggleActionClass(this.previous, toggle);
    }

    if (this.next) {
      const { toggle } = await this.calculateNext();
      this.renderLastAction(toggle);
      this.toggleActionClass(this.next, toggle);
    }
  }

  private async scrollLast() {
    let next = await this.executeNext();
    while (next) {
      if (this.weeks) this.weeks.innerHTML = EMPTY_STRING;
      next = await this.executeNext();
    }
  }

  private async initialRender() {
    const { toggle } = await this.calculateNext();

    if (!toggle) {
      this.renderWeeks();
    } else {
      this.scrollLast();
    }
  }

  protected async templateLoaded() {
    this.weeks = this.document.querySelector("#weeks");
    this.previous = this.document.querySelector("#previous");
    this.next = this.document.querySelector("#next");
    this.last = this.document.querySelector("#last");

    this.initialRender();
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
      const skippedCounter: number = this.page * LEAF_COUNT;
      const weekLabel: string = `W${counter + skippedCounter + WEEK_ADDED}`;

      if (counter == weekCount - WEEK_ADDED) {
        leafElement.setAttribute(LEAF_ACTIVE_ATTRIBUTE, LEAF_ACTIVE_VALUE);
      }

      leafElement.setAttribute(LEAF_WEEK_ATTRIBUTE, weekLabel);
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
