import { Component } from "../../component.js";

export class ShellComponent extends Component {
  constructor() {
    super();
    this.loadTemplate("/components/shell/shell.html");
  }
}
