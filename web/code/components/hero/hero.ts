import type { UserProfile } from "../../services/authentification.js";

import { Component } from "../../component.js";
import { AuthentificationService } from "../../services/authentification.js";

type Undefined<T> = undefined | T;

const DEFAULT_USERNAME: string = "User";
const DATE_STRING_TYPE: "long" = "long";
const LOCALE: string = "en-US";

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
      this.greeting.textContent = `Good morning, ${firstName}`;
    }
  }
}
