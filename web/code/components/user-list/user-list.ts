import { Component } from "../../component.js";

export class UserListComponent extends Component {
  constructor() {
    super();
    this.loadTemplate("/components/user-list/user-list.html");
  }
}
