import { Component, type ElementSignal } from "../../component.js";
import { API_URL } from "../../constants/api.js";
import type { Report } from "../../services/attendance.js";
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

const DATE_STRING_TYPE: "long" = "long";
const LOCALE: string = "en-US";

const QUEUE_API: string = "/attendance/queue";

const HIDDEN_CLASS: string = "hidden";

const ONE: 1 = 1;

const QUEUE_ITEM_SELECTOR: string = "queue-item-component";

export class ReviewQueueComponent extends Component {
  private authService = AuthentificationService.inject();

  private date: ElementSignal<Element> = this.element("#date");
  private content: ElementSignal<Element> = this.element("#content");
  private class: ElementSignal<Element> = this.element("#class-selector");
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
    const queue = await this.loadQueue();

    queue.forEach((report, index) => {
      const queueElement = document.createElement(QUEUE_ITEM_SELECTOR);
      const fullName: string = `${report.user.firstName} ${report.user.surName}`;
      const userClass: Undefined<number> = report.user.class;
      queueElement.setAttribute(QUEUE_ITEM_NAME, fullName);

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
    const currentDate: Date = new Date();

    const dayName: string = this.getDayName(currentDate);
    const monthName: string = this.getMonthName(currentDate);
    this.date().textContent = `${dayName} ${currentDate.getDate()} ${monthName} `;

    this.classSetup();
    this.renderQueue();
  }
}
