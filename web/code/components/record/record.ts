import { Component } from "../../component.js";
import { AttendanceService, ReportStatus } from "../../services/attendance.js";
import { NavigationService } from "../../services/navigation.js";
import type { DetailComponent } from "../detail/detail.js";

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
const ENTRY_ID_ATTRIBUTE: string = "identifier";

const DETAIL_WEEK_ATTRIBUTE: string = "week";
const DETAIL_DATE_ATTRIBUTE: string = "date";

const HIDDEN_CLASS: string = "hidden";

const EMPTY_STRING: string = "";

const ENTRY_OPEN_ATTRIBUTE: string = "open";
const ENTRY_OPEN_VALUE: string = "true";

const STORAGE_WEEK_KEY: string = "week";
const BASE_WEEK_STRING: string = "1";

const HOUR_STRING: string = "h";
const MINUTE_STRING: string = "min";
const DEFAULT_TIME_STING: string = "0";
const ONE_HOUR_MINUTES: number = 60;

const DASHBOARD_PATH: string = "home";

const ONE: 1 = 1;

const CLICK_EVENT: string = "click";
const SUBMIT_EVENT: string = "submit";
const DELETE_EVENT: string = "delete";

const WEEK_MILLISECONDS: number = 604800000;

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { month: "long" };
const DATE_FORMAT: string = "default";
const MONTH_START: number = 0;
const MONTH_END: number = 3;

const STATUS_COLOR_EMPTY: string = "bg-slate-400";
const STATUS_COLOR_DRAFT: string = "bg-indigo-500";
const STATUS_COLOR_SUBMITTED: string = "bg-orange-500";
const STATUS_COLOR_APPROVED: string = "bg-green-600";
const STATUS_COLOR_REJECTED: string = "bg-red-500";

const STATUS_COLOR_LIST: string[] = [
  STATUS_COLOR_EMPTY,
  STATUS_COLOR_DRAFT,
  STATUS_COLOR_SUBMITTED,
  STATUS_COLOR_REJECTED,
  STATUS_COLOR_APPROVED,
];

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
  private time: Nullable<HTMLElement> = null;
  private count: Nullable<HTMLElement> = null;
  private date: Nullable<HTMLElement> = null;
  private save: Nullable<HTMLElement> = null;
  private dot: Nullable<HTMLElement> = null;
  private status: Nullable<HTMLElement> = null;
  private submit: Nullable<HTMLElement> = null;

  private entries: Entry[] = [];

  constructor() {
    super();
    this.loadTemplate("/components/record/record.html");
  }

  private handleEntryEdit(entryElement: HTMLElement, entry: Entry) {
    entryElement.addEventListener(CLICK_EVENT, () => {
      const identifier = entryElement.getAttribute(ENTRY_ID_ATTRIBUTE);

      if (this.detail && identifier) {
        this.detail.setAttribute(ENTRY_ID_ATTRIBUTE, identifier);
        this.detail.setDetail(entry.type, entry.about, entry.duration);
        this.detail.setAttribute(ENTRY_OPEN_ATTRIBUTE, ENTRY_OPEN_VALUE);
      }
    });
  }

  private renderTime() {
    if (!this.entries.length && this.time) {
      this.time.textContent = `${DEFAULT_TIME_STING} ${MINUTE_STRING}`;
      return;
    }

    const fullMinutes = this.entries
      .map((entry) => {
        return parseInt(entry.duration);
      })
      .reduce((previousValue, nextValue) => {
        previousValue += nextValue;
        return previousValue;
      });

    const hours: number = Math.floor(fullMinutes / ONE_HOUR_MINUTES);
    const minutes: number = fullMinutes - ONE_HOUR_MINUTES * hours;
    const hourString: string = hours ? `${hours} ${HOUR_STRING}` : EMPTY_STRING;

    if (this.time) {
      this.time.textContent = `${hourString}  ${minutes} ${MINUTE_STRING}`;
    }
  }

  private setStatus(status: ReportStatus) {
    if (this.status) this.status.textContent = status;
    STATUS_COLOR_LIST.forEach((statusColor) => {
      if (this.dot) this.dot.classList.remove(statusColor);
    });

    switch (status) {
      case ReportStatus.Empty:
        if (this.dot) this.dot.classList.add(STATUS_COLOR_EMPTY);
        break;
      case ReportStatus.Draft:
        if (this.dot) this.dot.classList.add(STATUS_COLOR_DRAFT);
        break;
      case ReportStatus.Submitted:
        if (this.dot) this.dot.classList.add(STATUS_COLOR_SUBMITTED);
        break;
      case ReportStatus.Rejected:
        if (this.dot) this.dot.classList.add(STATUS_COLOR_REJECTED);
        break;
      case ReportStatus.Approved:
        if (this.dot) this.dot.classList.add(STATUS_COLOR_APPROVED);
        break;
    }
  }

  private renderEntries() {
    const empty = this.empty;
    const content = this.content;

    if (this.count) this.count.textContent = this.entries.length.toString();

    if (!empty || !content) return;

    this.renderTime();

    if (!this.entries.length) {
      content.classList.add(HIDDEN_CLASS);
      empty.classList.remove(HIDDEN_CLASS);
      return;
    }

    content.innerHTML = EMPTY_STRING;

    this.entries.forEach((entry, index) => {
      const entryElement = document.createElement(ENTRY_SELECTOR);

      entryElement.setAttribute(ENTRY_TYPE_ATTRIBUTE, entry.type);
      entryElement.setAttribute(ENTRY_ABOUT_ATTRIBUTE, entry.about);
      entryElement.setAttribute(ENTRY_DURATION_ATTRIBUTE, entry.duration);
      entryElement.setAttribute(ENTRY_ID_ATTRIBUTE, index.toString());

      this.handleEntryEdit(entryElement, entry);

      content.appendChild(entryElement);
    });

    empty.classList.add(HIDDEN_CLASS);
    content.classList.remove(HIDDEN_CLASS);
  }

  private renderWeek(number: number) {
    if (this.week) this.week.textContent = `${number}`;
    if (this.detail) {
      this.detail.setAttribute(DETAIL_WEEK_ATTRIBUTE, `${number}`);
    }
  }

  private reset() {
    this.entries = [];
    this.renderEntries();
  }

  private handleEntrySubmit(detail: DetailComponent, entry: Entry) {
    const identifier = detail.getAttribute(ENTRY_ID_ATTRIBUTE);

    if (identifier) {
      const identifierNumber: number = parseInt(identifier);
      this.entries.splice(identifierNumber, ONE, entry);
      detail.removeAttribute(ENTRY_ID_ATTRIBUTE);
    } else {
      this.entries.push(entry);
    }

    this.renderEntries();
  }

  private bindEvents() {
    const detail = this.detail;
    const save = this.save;
    const submit = this.submit;

    if (detail) {
      detail.addEventListener(SUBMIT_EVENT, (event: Event) => {
        const customEvent: CustomEvent = event as CustomEvent;
        this.handleEntrySubmit(detail, customEvent.detail);
      });

      detail.addEventListener(DELETE_EVENT, (event: Event) => {
        const customEvent: CustomEvent = event as CustomEvent;
        this.entries.splice(customEvent.detail, ONE);
        this.renderEntries();
      });
    }

    if (save) {
      save.addEventListener(CLICK_EVENT, async () => {
        const weekNumber: number = this.loadWeek();
        const rows = this.entries.map((entry) => {
          return {
            type: entry.type,
            duration: parseInt(entry.duration),
            about: entry.about.length ? entry.about : undefined,
          };
        });

        await this.attendanceService.saveRecord(weekNumber, rows);
        this.setStatus(ReportStatus.Draft);
      });
    }

    if (submit) {
      submit.addEventListener(CLICK_EVENT, async () => {
        const weekNumber: number = this.loadWeek();
        await this.attendanceService.submitRecord(weekNumber);
        this.setStatus(ReportStatus.Submitted);
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
        this.reset();
      });
    }

    if (this.previous) {
      this.previous.addEventListener(CLICK_EVENT, () => {
        const weekNumber: number = this.loadWeek();
        const newWeekNumber: number = weekNumber - ONE;
        if (newWeekNumber < ONE) return;
        this.setWeek(newWeekNumber);
        this.reset();
      });
    }

    if (this.add) {
      const detail = this.detail;
      this.add.addEventListener(CLICK_EVENT, () => {
        if (detail) detail.setAttribute(ENTRY_OPEN_ATTRIBUTE, ENTRY_OPEN_VALUE);
      });
    }
  }

  private getMontName(date: Date) {
    return date.toLocaleString(DATE_FORMAT, DATE_FORMAT_OPTIONS);
  }

  private renderDate(weekNumber: number) {
    const leaf = this.attendanceService.leaf;
    if (!leaf || !leaf.season) return;
    const startTime: number = leaf.season.start;

    const weekTimeStart: number = (weekNumber - ONE) * WEEK_MILLISECONDS;
    const weekTimeEnd: number = weekNumber * WEEK_MILLISECONDS;

    const weekDateStart: Date = new Date(startTime + weekTimeStart);
    const weekDateEnd: Date = new Date(startTime + weekTimeEnd);

    const dateMonthStart = this.getMontName(weekDateStart);
    const dateMonthStartSlice = dateMonthStart.slice(MONTH_START, MONTH_END);

    const dateMonthEnd = this.getMontName(weekDateEnd);
    const dateMonthEndSlice = dateMonthEnd.slice(MONTH_START, MONTH_END);

    const dateStartString: string = `${weekDateStart.getDate()} ${dateMonthStartSlice}`;
    const dateEndString: string = `${weekDateEnd.getDate()} ${dateMonthEndSlice} ${weekDateEnd.getFullYear()}`;

    const dateString: string = `${dateStartString} - ${dateEndString}`;
    if (this.date) this.date.textContent = dateString;
    if (this.detail) {
      this.detail.setAttribute(DETAIL_DATE_ATTRIBUTE, dateString);
    }
  }

  private async setWeek(weekNumber: number) {
    sessionStorage.setItem(STORAGE_WEEK_KEY, weekNumber.toString());
    this.reset();
    this.setStatus(ReportStatus.Empty);
    await this.loadEntries(weekNumber);
    this.renderDate(weekNumber);
    this.renderWeek(weekNumber);
  }

  private loadWeek() {
    const storedWeekString = sessionStorage.getItem(STORAGE_WEEK_KEY);
    const storedWeek: number = parseInt(storedWeekString ?? BASE_WEEK_STRING);
    return storedWeek;
  }

  private async loadEntries(weekNumber: number) {
    const report = await this.attendanceService.fetchRecord(weekNumber);

    if (report) {
      const reports = report.rows.map((row) => {
        return {
          type: row.type,
          about: row.about ?? "",
          duration: row.duration.toString(),
        };
      });

      this.setStatus(report.status);
      this.entries = reports;
      this.renderEntries();
    }
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
    this.time = this.document.querySelector("#time");
    this.count = this.document.querySelector("#count");
    this.date = this.document.querySelector("#date");
    this.save = this.document.querySelector("#save");
    this.dot = this.document.querySelector("#dot");
    this.status = this.document.querySelector("#status");
    this.submit = this.document.querySelector("#submit");

    const weekNumber = this.loadWeek();

    await this.loadEntries(weekNumber);
    this.renderWeek(weekNumber);
    this.renderDate(weekNumber);
    this.bindNavigation();
    this.bindEvents();
  }
}
