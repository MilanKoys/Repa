import { Component } from "../../component.js";

export class DashboardComponent extends Component {
  constructor() {
    super();
    this.loadTemplate("/components/dashboard/dashboard.html");
  }
}
