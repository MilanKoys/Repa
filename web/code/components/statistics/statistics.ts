import { Component, type ElementSignal } from "../../component.js";
import { AttendanceService, ReportStatus } from "../../services/attendance.js";

const HOUR_STRING: string = "h";
const MINUTE_STRING: string = "min";
const ONE_HOUR_MINUTES: number = 60;
const EMPTY_STRING: string = "";

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
    if (!thisWeek) return;

    const totalTime = thisWeek.rows
      .map((row) => row.duration)
      .reduce((accumulator: number, duration: number) => {
        accumulator += duration;
        return accumulator;
      });

    const hours: number = Math.floor(totalTime / ONE_HOUR_MINUTES);
    const minutes: number = totalTime - ONE_HOUR_MINUTES * hours;
    const hourString: string = hours ? `${hours} ${HOUR_STRING}` : EMPTY_STRING;

    const totalReview = records.filter((record) => {
      return record.status === ReportStatus.Submitted;
    });

    const totalChanges = records.filter((record) => {
      return record.status === ReportStatus.Rejected;
    });

    this.logged().textContent = `${hourString}  ${minutes} ${MINUTE_STRING}`;
    this.review().textContent = totalReview.length.toString();
    this.changes().textContent = totalChanges.length.toString();
  }

  protected async templateLoaded() {
    await this.attendanceService.initialized;
    await this.render();
  }
}
