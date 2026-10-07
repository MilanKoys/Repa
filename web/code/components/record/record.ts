import { Component } from "../../component.js";
import { AttendanceService } from "../../services/attendance.js";
import { NavigationService } from "../../services/navigation.js";
import type { DetailComponent } from "../detail/detail.js";
import type { EntryComponent } from "../entry/entry.js";

type Nullable<T> = null | T;

interface Entry {
  type: string;
  duration: string;
  about: string;
}

const ENTRY_SELECTOR: string = "entry-component";
const ENTRY_TYPE_ATTRIBUTE: string = "type";
const ENTRY_ABOUT_ATTRIBUTE: string = "about";
const ENTRY_DURATION_ATTRIBUTE: string = "duration";

const HIDDEN_CLASS: string = "hidden";

const EMPTY_STRING: string = "";

const ENTRY_OPEN_ATTRIBUTE: string = "open";
const ENTRY_OPEN_VALUE: string = "true";

const STORAGE_WEEK_KEY: string = "week";
const BASE_WEEK_STRING: string = "1";

const DASHBOARD_PATH: string = "home";

const ONE: 1 = 1;

const CLICK_EVENT: string = "click";
const SUBMIT_EVENT: string = "submit";

export class RecordComponent extends Component {
  private navigationService = NavigationService.inject();
  private attendanceService = AttendanceService.inject();

  private detail: Nullable<DetailComponent> = null;
  private week: Nullable<HTMLElement> = null;
  private next: Nullable<HTMLElement> = null;
  private previous: Nullable<HTMLElement> = null;
  private back: Nullable<HTMLElement> = null;
  private add: Nullable<HTMLElement> = null;
  private empty: Nullable<HTMLElement> = null;
  private content: Nullable<HTMLElement> = null;

  private entries: Entry[] = [];

  constructor() {
    super();
    this.loadTemplate("/components/record/record.html");
  }

  private renderEntries() {
    const empty = this.empty;
    const content = this.content;

    if (!empty || !content) return;

    if (!this.entries.length) {
      content.classList.add(HIDDEN_CLASS);
      empty.classList.remove(HIDDEN_CLASS);
      return;
    }

    content.innerHTML = EMPTY_STRING;

    this.entries.forEach((entry) => {
      const entryElement = document.createElement(ENTRY_SELECTOR);

      entryElement.setAttribute(ENTRY_TYPE_ATTRIBUTE, entry.type);
      entryElement.setAttribute(ENTRY_ABOUT_ATTRIBUTE, entry.about);
      entryElement.setAttribute(ENTRY_DURATION_ATTRIBUTE, entry.duration);

      content.appendChild(entryElement);
    });

    empty.classList.add(HIDDEN_CLASS);
    content.classList.remove(HIDDEN_CLASS);
  }

  private renderWeek(number: number) {
    if (this.week) this.week.textContent = `${number}`;
  }

  private reset() {
    this.entries = [];
  }

  private bindEvents() {
    if (this.detail) {
      this.detail.addEventListener(SUBMIT_EVENT, (event: Event) => {
        const customEvent: CustomEvent = event as CustomEvent;
        this.entries.push(customEvent.detail);
        this.renderEntries();
        console.log(this.entries);
      });
    }
  }

  private bindNavigation() {
    if (this.back) {
      this.back.addEventListener(CLICK_EVENT, () => {
        this.navigationService.navigate(DASHBOARD_PATH);
      });
    }

    if (this.next) {
      this.next.addEventListener(CLICK_EVENT, () => {
        const weekNumber: number = this.loadWeek();
        const newWeekNumber: number = weekNumber + ONE;
        if (newWeekNumber > this.attendanceService.weekAmount) return;
        this.setWeek(newWeekNumber);
      });
    }

    if (this.previous) {
      this.previous.addEventListener(CLICK_EVENT, () => {
        const weekNumber: number = this.loadWeek();
        const newWeekNumber: number = weekNumber - ONE;
        if (newWeekNumber < ONE) return;
        this.setWeek(newWeekNumber);
      });
    }

    if (this.add) {
      const entry = this.detail;
      this.add.addEventListener(CLICK_EVENT, () => {
        if (entry) entry.setAttribute(ENTRY_OPEN_ATTRIBUTE, ENTRY_OPEN_VALUE);
      });
    }
  }

  private setWeek(weekNumber: number) {
    sessionStorage.setItem(STORAGE_WEEK_KEY, weekNumber.toString());
    this.reset();
    this.renderWeek(weekNumber);
  }

  private loadWeek() {
    const storedWeekString = sessionStorage.getItem(STORAGE_WEEK_KEY);
    const storedWeek: number = parseInt(storedWeekString ?? BASE_WEEK_STRING);
    return storedWeek;
  }

  protected async templateLoaded() {
    await this.attendanceService.initialized;

    this.detail = this.document.querySelector("#detail");
    this.week = this.document.querySelector("#week");
    this.next = this.document.querySelector("#next");
    this.previous = this.document.querySelector("#previous");
    this.back = this.document.querySelector("#back");
    this.add = this.document.querySelector("#add");
    this.empty = this.document.querySelector("#empty");
    this.content = this.document.querySelector("#content");

    const weekNumber = this.loadWeek();

    this.renderWeek(weekNumber);
    this.bindNavigation();
    this.bindEvents();
  }
}
