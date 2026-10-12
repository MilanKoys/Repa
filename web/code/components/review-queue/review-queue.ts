import { Component, type ElementSignal } from "../../component.js";
import { API_URL } from "../../constants/api.js";
import type { Report } from "../../services/attendance.js";
import { AuthentificationService } from "../../services/authentification.js";

const QUEUE_ITEM_NAME: string = "name";
const QUEUE_ITEM_CLASS: string = "class";

const DATE_STRING_TYPE: "long" = "long";
const LOCALE: string = "en-US";

const QUEUE_API: string = "/attendance/queue";

const HIDDEN_CLASS: string = "hidden";

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
    const queue: Report[] = await response.json();
    return queue;
  }

  private async renderQueue() {
    const queue = await this.loadQueue();

    queue.forEach((report) => {
      const queueElement = document.createElement(QUEUE_ITEM_SELECTOR);
      queueElement.setAttribute(QUEUE_ITEM_NAME, report.user);
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
