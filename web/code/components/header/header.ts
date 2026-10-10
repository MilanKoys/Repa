import type { UserProfile } from "../../services/authentification.js";

import { Component, type ElementSignal } from "../../component.js";
import { AuthentificationService } from "../../services/authentification.js";

type Undefined<T> = undefined | T;

const LOGIN_PAGE: string = "/login";

const CLICK_EVENT: string = "click";

const DEFAULT_USERNAME: string = "User";

const DEFAULT_AVATAR: string = "UR";

export class HeaderComponent extends Component {
  private authService = AuthentificationService.inject();

  private logout: ElementSignal<Element> = this.element("#logout");
  private username: ElementSignal<Element> = this.element("#username");
  private avatar: ElementSignal<Element> = this.element("#avatar");

  constructor() {
    super();
    this.loadTemplate("/components/header/header.html");
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

  private async loadName() {
    const userProfile: Undefined<UserProfile> = await this.loadUserProfile();

    if (userProfile) {
      return `${userProfile.firstName} ${userProfile.surName}`;
    } else {
      return DEFAULT_USERNAME;
    }
  }

  private async loadAvatar() {
    const userProfile: Undefined<UserProfile> = await this.loadUserProfile();

    if (userProfile) {
      return `${userProfile.firstName.slice(0, 1)}${userProfile.surName.slice(0, 1)}`;
    } else {
      return DEFAULT_AVATAR;
    }
  }

  protected async templateLoaded() {
    this.avatar().textContent = await this.loadAvatar();

    const name: string = await this.loadName();
    this.username().textContent = name;

    this.logout().addEventListener(CLICK_EVENT, async () => {
      await this.authService.logout();
      await this.verifySession();
    });
  }

  async verifySession() {
    const session = await this.authService.loadSession();
    if (!session) location.href = LOGIN_PAGE;
  }
}
