import { Component } from "../../component.js";
import { AuthentificationService } from "../../services/authentification.js";

const LOGIN_PAGE: string = "/login";

export class ShellComponent extends Component {
  private authService = AuthentificationService.inject();

  constructor() {
    super();
    this.loadTemplate("/components/shell/shell.html");
    this.verifySession();
  }

  async verifySession() {
    const session = await this.authService.loadSession();
    if (!session) location.href = LOGIN_PAGE;
  }
}
