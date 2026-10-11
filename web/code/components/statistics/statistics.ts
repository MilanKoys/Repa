import { Component, type ElementSignal } from "../../component.js";
import { AttendanceService, ReportStatus } from "../../services/attendance.js";

const HOUR_STRING: string = "h";
const MINUTE_STRING: string = "min";
const ONE_HOUR_MINUTES: number = 60;
const DEFAULT_VALUE: string = "0";

const EMPTY_STRING: string = "";

const TEXT_ATTRIBUTE: string = "text";

const HIDDEN_CLASS: string = "hidden";

export class StatisticsComponent extends Component {
  private attendanceService = AttendanceService.inject();

  private logged: ElementSignal<Element> = this.element("#logged");
  private review: ElementSignal<Element> = this.element("#review");
  private changes: ElementSignal<Element> = this.element("#changes");

  constructor() {
    super();
    this.loadTemplate("/components/statistics/statistics.html");
  }

  private async render() {
    const records = await this.attendanceService.fetchRecords();
    const weekNumber = this.attendanceService.weekAmount;
    const thisWeek = records.find((record) => record.week === weekNumber);

    if (!records.length) {
      this.logged().classList.add(HIDDEN_CLASS);
      this.review().classList.add(HIDDEN_CLASS);
      this.changes().classList.add(HIDDEN_CLASS);
    }

    if (!thisWeek) {
      this.logged().setAttribute(TEXT_ATTRIBUTE, DEFAULT_VALUE);
    } else {
      const totalTime = thisWeek.rows
        .map((row) => row.duration)
        .reduce((accumulator: number, duration: number) => {
          accumulator += duration;
          return accumulator;
        });

      const hours: number = Math.floor(totalTime / ONE_HOUR_MINUTES);
      const minutes: number = totalTime - ONE_HOUR_MINUTES * hours;
      const hour: string = hours ? `${hours} ${HOUR_STRING}` : EMPTY_STRING;
      const timeString: string = `${hour}  ${minutes} ${MINUTE_STRING}`;

      this.logged().setAttribute(TEXT_ATTRIBUTE, timeString);
    }

    const totalReview = records.filter((record) => {
      return record.status === ReportStatus.Submitted;
    });

    this.review().setAttribute(TEXT_ATTRIBUTE, totalReview.length.toString());

    const totalChanges = records.filter((record) => {
      return record.status === ReportStatus.Rejected;
    });

    this.changes().setAttribute(TEXT_ATTRIBUTE, totalChanges.length.toString());
  }

  protected async templateLoaded() {
    await this.attendanceService.initialized;
    await this.render();
  }
}
