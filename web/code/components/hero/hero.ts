import type { UserProfile } from "../../services/authentification.js";

import { Component } from "../../component.js";
import { AuthentificationService } from "../../services/authentification.js";

type Undefined<T> = undefined | T;

interface DayGreeting {
  range: [number, number];
  greeting: string;
}

const DEFAULT_USERNAME: string = "User";
const DATE_STRING_TYPE: "long" = "long";
const LOCALE: string = "en-US";

const FIRST_INDEX: 0 = 0;
const LAST_INDEX: 1 = 1;

const MORNING_RANGE: [number, number] = [0, 12];
const AFTERNOON_RANGE: [number, number] = [13, 15];
const NOON_RANGE: [number, number] = [16, 19];
const NIGHT_RANGE: [number, number] = [20, 24];

const MORNING_GREETING: string = "Good morning";
const AFTERNOON_GREETING: string = "Good afternoon";
const NOON_GREETING: string = "Good noon";
const NIGHT_GREETING: string = "Good night";

const DAY_GREETING_LIST: [[number, number], string][] = [
  [MORNING_RANGE, MORNING_GREETING],
  [AFTERNOON_RANGE, AFTERNOON_GREETING],
  [NOON_RANGE, NOON_GREETING],
  [NIGHT_RANGE, NIGHT_GREETING],
];

const DAY_GREEINGS: DayGreeting[] = DAY_GREETING_LIST.map((items) => {
  return {
    range: items[FIRST_INDEX],
    greeting: items[LAST_INDEX],
  };
});

export class HeroComponent extends Component {
  private authService = AuthentificationService.inject();

  private date: HTMLElement | null = null;
  private greeting: HTMLElement | null = null;

  constructor() {
    super();
    this.loadTemplate("/components/hero/hero.html");
  }

  private async loadUserProfile(): Promise<Undefined<UserProfile>> {
    if (!this.authService.userProfile) {
      return await this.authService.loadUserProfile();
    } else {
      return new Promise((resolve) => {
        resolve(this.authService.userProfile);
      });
    }
  }

  private getDayName(date: Date) {
    return date.toLocaleDateString(LOCALE, { weekday: DATE_STRING_TYPE });
  }

  private getMonthName(date: Date) {
    return date.toLocaleDateString(LOCALE, { month: DATE_STRING_TYPE });
  }

  private async loadFirstName() {
    const userProfile: Undefined<UserProfile> = await this.loadUserProfile();

    if (userProfile) {
      return userProfile.firstName;
    } else {
      return DEFAULT_USERNAME;
    }
  }

  protected async templateLoaded() {
    this.date = this.document.querySelector("#date");
    this.greeting = this.document.querySelector("#greeting");

    const currentDate: Date = new Date();

    if (this.date) {
      const dayName: string = this.getDayName(currentDate);
      const monthName: string = this.getMonthName(currentDate);
      this.date.textContent = `${dayName} ${currentDate.getDate()} ${monthName} `;
    }

    if (this.greeting) {
      const firstName: string = await this.loadFirstName();
      const hour: number = new Date().getHours();
      let dayGreeting: string = "Good day";

      DAY_GREEINGS.forEach((dayGreetingItem) => {
        const range: [number, number] = dayGreetingItem.range;
        const greeting: string = dayGreetingItem.greeting;
        if (hour >= range[FIRST_INDEX] && hour <= range[LAST_INDEX]) {
          dayGreeting = greeting;
        }
      });

      this.greeting.textContent = `${dayGreeting}, ${firstName}`;
    }
  }
}
