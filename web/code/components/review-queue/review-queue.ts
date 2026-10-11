import { Component, type ElementSignal } from "../../component.js";

const DATE_STRING_TYPE: "long" = "long";
const LOCALE: string = "en-US";

export class ReviewQueueComponent extends Component {
  private date: ElementSignal<Element> = this.element("#date");

  constructor() {
    super();
    this.loadTemplate("/components/review-queue/review-queue.html");
  }

  private getDayName(date: Date) {
    return date.toLocaleDateString(LOCALE, { weekday: DATE_STRING_TYPE });
  }

  private getMonthName(date: Date) {
    return date.toLocaleDateString(LOCALE, { month: DATE_STRING_TYPE });
  }

  protected templateLoaded(): void {
    const currentDate: Date = new Date();

    const dayName: string = this.getDayName(currentDate);
    const monthName: string = this.getMonthName(currentDate);
    this.date().textContent = `${dayName} ${currentDate.getDate()} ${monthName} `;
  }
}
