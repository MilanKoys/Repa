import { Component } from "../../component.js";
import { AttendanceService } from "../../services/attendance.js";

type Nullable<T> = null | T;

const STORAGE_WEEK_KEY: string = "week";
const BASE_WEEK_STRING: string = "1";

const ONE: 1 = 1;

const CLICK_EVENT: string = "click";

export class RecordComponent extends Component {
  private attendanceService = AttendanceService.inject();

  private week: Nullable<HTMLElement> = null;
  private next: Nullable<HTMLElement> = null;
  private previous: Nullable<HTMLElement> = null;

  constructor() {
    super();
    this.loadTemplate("/components/record/record.html");
  }

  private renderWeek(number: number) {
    if (this.week) this.week.textContent = `${number}`;
  }

  private bindNavigation() {
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

    const weekNumber = this.loadWeek();

    this.renderWeek(weekNumber);
    this.bindNavigation();
  }
}
