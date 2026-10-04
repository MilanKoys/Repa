import { Component } from "../../component.js";

export class WeeksComponent extends Component {
  constructor() {
    super();
    this.loadTemplate("/components/weeks/weeks.html");
  }

  protected async templateLoaded() {}
}
