import { Component } from "../../component.js";
import { AttendanceService } from "../../services/attendance.js";
import { NavigationService } from "../../services/navigation.js";
import type { EntryComponent } from "../entry/entry.js";

type Nullable<T> = null | T;

const ENTRY_OPEN_ATTRIBUTE: string = "open";
const ENTRY_OPEN_VALUE: string = "true";

const STORAGE_WEEK_KEY: string = "week";
const BASE_WEEK_STRING: string = "1";

const DASHBOARD_PATH: string = "home";

const ONE: 1 = 1;

const CLICK_EVENT: string = "click";

export class RecordComponent extends Component {
  private navigationService = NavigationService.inject();
  private attendanceService = AttendanceService.inject();

  private week: Nullable<HTMLElement> = null;
  private next: Nullable<HTMLElement> = null;
  private previous: Nullable<HTMLElement> = null;
  private back: Nullable<HTMLElement> = null;
  private add: Nullable<HTMLElement> = null;
  private entry: Nullable<EntryComponent> = null;

  constructor() {
    super();
    this.loadTemplate("/components/record/record.html");
  }

  private renderWeek(number: number) {
    if (this.week) this.week.textContent = `${number}`;
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
      const entry = this.entry;
      this.add.addEventListener(CLICK_EVENT, () => {
        if (entry) entry.setAttribute(ENTRY_OPEN_ATTRIBUTE, ENTRY_OPEN_VALUE);
      });
    }
  }

  private setWeek(weekNumber: number) {
    sessionStorage.setItem(STORAGE_WEEK_KEY, weekNumber.toString());
    this.renderWeek(weekNumber);
  }

  private loadWeek() {
    const storedWeekString = sessionStorage.getItem(STORAGE_WEEK_KEY);
    const storedWeek: number = parseInt(storedWeekString ?? BASE_WEEK_STRING);
    return storedWeek;
  }

  protected async templateLoaded() {
    await this.attendanceService.initialized;

    this.week = this.document.querySelector("#week");
    this.next = this.document.querySelector("#next");
    this.previous = this.document.querySelector("#previous");
    this.back = this.document.querySelector("#back");
    this.add = this.document.querySelector("#add");
    this.entry = this.document.querySelector("#entry");

    const weekNumber = this.loadWeek();

    this.renderWeek(weekNumber);
    this.bindNavigation();
  }
}
