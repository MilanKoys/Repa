import { Component, type ElementSignal } from "../../component.js";
import { AttendanceService, ReportStatus } from "../../services/attendance.js";
import { NavigationService } from "../../services/navigation.js";
import type { DetailComponent } from "../detail/detail.js";

type Nullable<T> = null | T;

interface Entry {
  type: string;
  duration: string;
  about: string;
}

const TRUE_VALUE: string = "true";

const ENTRY_SELECTOR: string = "entry-component";
const ENTRY_TYPE_ATTRIBUTE: string = "type";
const ENTRY_ABOUT_ATTRIBUTE: string = "about";
const ENTRY_DURATION_ATTRIBUTE: string = "duration";
const ENTRY_ID_ATTRIBUTE: string = "identifier";
const ENTRY_READONLY_ATTRIBUTE: string = "readonly";

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

  private readonly: boolean = false;

  private detail: ElementSignal<DetailComponent> = this.element("#detail");
  private week: ElementSignal<Element> = this.element("#week");
  private next: ElementSignal<Element> = this.element("#next");
  private previous: ElementSignal<Element> = this.element("#previous");
  private back: ElementSignal<Element> = this.element("#back");
  private add: ElementSignal<Element> = this.element("#add");
  private empty: ElementSignal<Element> = this.element("#empty");
  private content: ElementSignal<Element> = this.element("#content");
  private time: ElementSignal<Element> = this.element("#time");
  private count: ElementSignal<Element> = this.element("#count");
  private date: ElementSignal<Element> = this.element("#date");
  private save: ElementSignal<Element> = this.element("#save");
  private dot: ElementSignal<Element> = this.element("#dot");
  private status: ElementSignal<Element> = this.element("#status");
  private submit: ElementSignal<Element> = this.element("#submit");
  private done: ElementSignal<Element> = this.element("#done");

  private entries: Entry[] = [];

  constructor() {
    super();
    this.loadTemplate("/components/record/record.html");
  }

  private handleEntryEdit(entryElement: HTMLElement, entry: Entry) {
    entryElement.addEventListener(CLICK_EVENT, () => {
      const identifier = entryElement.getAttribute(ENTRY_ID_ATTRIBUTE);

      if (identifier) {
        this.detail().setAttribute(ENTRY_ID_ATTRIBUTE, identifier);
        this.detail().setDetail(entry.type, entry.about, entry.duration);
        this.detail().setAttribute(ENTRY_OPEN_ATTRIBUTE, ENTRY_OPEN_VALUE);
      }
    });
  }

  private setReadonly(toggle: boolean) {
    if (toggle) {
      this.readonly = true;
      this.add().classList.add(HIDDEN_CLASS);
      this.submit().classList.add(HIDDEN_CLASS);
      this.save().classList.add(HIDDEN_CLASS);
      this.done().classList.remove(HIDDEN_CLASS);
    } else {
      this.readonly = false;
      this.add().classList.remove(HIDDEN_CLASS);
      this.submit().classList.remove(HIDDEN_CLASS);
      this.save().classList.remove(HIDDEN_CLASS);
      this.done().classList.add(HIDDEN_CLASS);
    }
  }

  private renderTime() {
    if (!this.entries.length) {
      this.time().textContent = `${DEFAULT_TIME_STING} ${MINUTE_STRING}`;
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

    this.time().textContent = `${hourString}  ${minutes} ${MINUTE_STRING}`;
  }

  private setStatus(status: ReportStatus) {
    this.status().textContent = status;
    STATUS_COLOR_LIST.forEach((statusColor) => {
      this.dot().classList.remove(statusColor);
    });

    switch (status) {
      case ReportStatus.Empty:
        this.dot().classList.add(STATUS_COLOR_EMPTY);
        break;
      case ReportStatus.Draft:
        this.dot().classList.add(STATUS_COLOR_DRAFT);
        break;
      case ReportStatus.Submitted:
        this.dot().classList.add(STATUS_COLOR_SUBMITTED);
        this.setReadonly(true);
        break;
      case ReportStatus.Rejected:
        this.dot().classList.add(STATUS_COLOR_REJECTED);
        break;
      case ReportStatus.Approved:
        this.dot().classList.add(STATUS_COLOR_APPROVED);
        break;
    }
  }

  private renderEntries() {
    this.count().textContent = this.entries.length.toString();

    this.renderTime();

    if (!this.entries.length) {
      this.content().classList.add(HIDDEN_CLASS);
      this.empty().classList.remove(HIDDEN_CLASS);
      return;
    }

    this.content().innerHTML = EMPTY_STRING;

    this.entries.forEach((entry, index) => {
      const entryElement = document.createElement(ENTRY_SELECTOR);

      entryElement.setAttribute(ENTRY_TYPE_ATTRIBUTE, entry.type);
      entryElement.setAttribute(ENTRY_ABOUT_ATTRIBUTE, entry.about);
      entryElement.setAttribute(ENTRY_DURATION_ATTRIBUTE, entry.duration);
      entryElement.setAttribute(ENTRY_ID_ATTRIBUTE, index.toString());

      if (this.readonly) {
        entryElement.setAttribute(ENTRY_READONLY_ATTRIBUTE, TRUE_VALUE);
      } else {
        this.handleEntryEdit(entryElement, entry);
      }

      this.content().appendChild(entryElement);
    });

    this.empty().classList.add(HIDDEN_CLASS);
    this.content().classList.remove(HIDDEN_CLASS);
  }

  private renderWeek(number: number) {
    this.week().textContent = `${number}`;
    this.detail().setAttribute(DETAIL_WEEK_ATTRIBUTE, `${number}`);
  }

  private reset() {
    this.setReadonly(false);
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

    detail().addEventListener(SUBMIT_EVENT, (event: Event) => {
      const customEvent: CustomEvent = event as CustomEvent;
      this.handleEntrySubmit(detail(), customEvent.detail);
    });

    detail().addEventListener(DELETE_EVENT, (event: Event) => {
      const customEvent: CustomEvent = event as CustomEvent;
      this.entries.splice(customEvent.detail, ONE);
      this.renderEntries();
    });

    save().addEventListener(CLICK_EVENT, async () => {
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

    submit().addEventListener(CLICK_EVENT, async () => {
      const weekNumber: number = this.loadWeek();
      await this.attendanceService.submitRecord(weekNumber);
      this.setStatus(ReportStatus.Submitted);
    });
  }

  private bindBack(element: Element) {
    element.addEventListener(CLICK_EVENT, () => {
      this.navigationService.navigate(DASHBOARD_PATH);
    });
  }

  private bindChangeWeek(
    element: Element,
    adder: number,
    checkCallback: (weekNumber: number) => boolean,
  ) {
    element.addEventListener(CLICK_EVENT, () => {
      const weekNumber: number = this.loadWeek();
      const newWeekNumber: number = weekNumber + adder;
      if (checkCallback(newWeekNumber)) return;
      this.setWeek(newWeekNumber);
      this.reset();
    });
  }

  private bindNavigation() {
    this.bindBack(this.back());
    this.bindBack(this.done());

    const nextCheck = (weekNumber: number) => {
      return weekNumber > this.attendanceService.weekAmount;
    };

    const previousCheck = (weekNumber: number) => {
      return weekNumber < ONE;
    };

    this.bindChangeWeek(this.next(), ONE, nextCheck);
    this.bindChangeWeek(this.previous(), -ONE, previousCheck);

    this.add().addEventListener(CLICK_EVENT, () => {
      this.detail().setAttribute(ENTRY_OPEN_ATTRIBUTE, ENTRY_OPEN_VALUE);
    });
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
    this.date().textContent = dateString;
    this.detail().setAttribute(DETAIL_DATE_ATTRIBUTE, dateString);
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
          about: row.about ?? EMPTY_STRING,
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

    const weekNumber = this.loadWeek();

    await this.loadEntries(weekNumber);
    this.renderWeek(weekNumber);
    this.renderDate(weekNumber);
    this.bindNavigation();
    this.bindEvents();
  }
}
