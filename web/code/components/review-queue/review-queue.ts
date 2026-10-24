import { Component, type ElementSignal } from "../../component.js";
import { API_URL } from "../../constants/api.js";
import { AttendanceService, type Report } from "../../services/attendance.js";
import {
  AuthentificationService,
  type UserProfile,
} from "../../services/authentification.js";

type Undefined<T> = undefined | T;

type Queue = Report & {
  user: UserProfile;
};

const TRUE_VALUE: string = "true";

const QUEUE_ITEM_NAME: string = "name";
const QUEUE_ITEM_CLASS: string = "class-name";
const QUEUE_ITEM_LAST: string = "last";
const QUEUE_ITEM_WEEK: string = "week";
const QUEUE_ITEM_CONTENT: string = "content";
const QUEUE_ITEM_DATE: string = "date";

const DATE_STRING_TYPE: "long" = "long";
const LOCALE: string = "en-US";

const WEEK_MILLISECONDS: number = 604800000;

const QUEUE_API: string = "/attendance/queue";

const HIDDEN_CLASS: string = "hidden";
const EMPTY_QUEUE_CLASSES: string[] = [
  "p-8",
  "flex",
  "items-center",
  "flex-col",
  "justify-center",
];

const ONE: 1 = 1;

const QUEUE_ITEM_SELECTOR: string = "queue-item-component";

const WEEK_STRING: string = "Week";
const DATE_DELIMITER: string = "·";

const JOIN_DELIMITER: string = ",";

const NO_WEEK_STRING: string = "No";
const EMPTY_QUEUE_STRING = "All caught up — nothing waiting for review.";

const DEFAULT_DATE_STRING: string = "No date";
const MONTH_START: number = 0;
const MONTH_END: number = 3;

export class ReviewQueueComponent extends Component {
  private authService = AuthentificationService.inject();
  private attendanceService = AttendanceService.inject();

  private date: ElementSignal<Element> = this.element("#date");
  private content: ElementSignal<Element> = this.element("#content");
  private class: ElementSignal<Element> = this.element("#class-selector");
  private count: ElementSignal<Element> = this.element("#count");
  private myClass: ElementSignal<Element> = this.element("#my-class");
  private allClass: ElementSignal<Element> = this.element("#all-class");

  private userProfile = this.authService.loadUserProfile();

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

  private async classSetup() {
    const userProfile = await this.userProfile;
    console.log(userProfile);

    if (!userProfile.class) {
      this.class().classList.add(HIDDEN_CLASS);
    }
  }

  private async loadQueue() {
    const response = await fetch(`${API_URL}${QUEUE_API}`);
    const queue: Queue[] = await response.json();
    return queue;
  }

  private async renderQueue() {
    const queue: Queue[] = await this.loadQueue();
    const queueCount: number = queue.length;

    if (queueCount) {
      this.count().textContent = queueCount.toString();
    } else {
      this.count().textContent = NO_WEEK_STRING;
      this.content().classList.add(...EMPTY_QUEUE_CLASSES);
      this.content().textContent = EMPTY_QUEUE_STRING;
    }

    queue.forEach((report, index) => {
      const queueElement = document.createElement(QUEUE_ITEM_SELECTOR);
      const fullName: string = `${report.user.firstName} ${report.user.surName}`;
      const userClass: Undefined<number> = report.user.class;
      const leaf = this.attendanceService.leaf;
      const content: string = report.rows
        .map((row) => row.type)
        .join(JOIN_DELIMITER);

      let dateString: string = DEFAULT_DATE_STRING;
      if (leaf && leaf.season) {
        const start = leaf.season.start;
        const dateStart = new Date(start + WEEK_MILLISECONDS * report.week);
        const dateEnd = new Date(dateStart.getTime() + WEEK_MILLISECONDS);
        const monthStartName: string = this.getMonthName(dateStart);
        const monthEndName: string = this.getMonthName(dateEnd);
        dateString = `${dateStart.getDate()} ${monthStartName.slice(MONTH_START, MONTH_END)} - ${dateEnd.getDate()} ${monthEndName.slice(MONTH_START, MONTH_END)}`;
      }

      queueElement.setAttribute(QUEUE_ITEM_NAME, fullName);
      queueElement.setAttribute(QUEUE_ITEM_WEEK, report.week.toString());
      queueElement.setAttribute(QUEUE_ITEM_CONTENT, content);
      queueElement.setAttribute(QUEUE_ITEM_DATE, dateString);

      if (userClass) {
        queueElement.setAttribute(QUEUE_ITEM_CLASS, `${userClass.toString()}V`);
      }

      if (index === queue.length - ONE) {
        queueElement.setAttribute(QUEUE_ITEM_LAST, TRUE_VALUE);
      }

      this.content().appendChild(queueElement);
    });
  }

  protected async templateLoaded() {
    await this.attendanceService.initialized;

    const currentDate: Date = new Date();

    const weekNumber: number = this.attendanceService.weekAmount;
    const dayName: string = this.getDayName(currentDate);
    const monthName: string = this.getMonthName(currentDate);
    this.date().textContent = `${dayName} ${currentDate.getDate()} ${monthName} ${DATE_DELIMITER} ${WEEK_STRING} ${weekNumber}`;

    this.classSetup();
    this.renderQueue();
  }
}
