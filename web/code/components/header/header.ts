import { Component } from "../../component.js";
import { AuthentificationService } from "../../services/authentification.js";

const LOGIN_PAGE: string = "/login";

const CLICK_EVENT: string = "click";

export class HeaderComponent extends Component {
  private authService = AuthentificationService.inject();

  private logout: HTMLElement | null = null;

  constructor() {
    super();
    this.loadTemplate("/components/header/header.html");
  }

  protected templateLoaded(): void {
    this.logout = this.document.querySelector("#logout");

    if (this.logout)
      this.logout.addEventListener(CLICK_EVENT, async () => {
        await this.authService.logout();
        await this.verifySession();
      });
  }

  async verifySession() {
    const session = await this.authService.loadSession();
    if (!session) location.href = LOGIN_PAGE;
  }
}
