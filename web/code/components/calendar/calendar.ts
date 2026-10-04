import { Component } from "../../component.js";

export class CalendarComponent extends Component {
  constructor() {
    super();
    this.loadTemplate("/components/calendar/calendar.html");
  }

  protected async templateLoaded() {}
}
