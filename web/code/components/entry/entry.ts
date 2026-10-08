import { Component } from "../../component.js";

const TYPE_NAME: string = "type";
const ABOUT_NAME: string = "about";
const DURATION_NAME: string = "duration";

const HOUR_STRING: string = "h";
const ONE_HOUR_MINUTES: number = 60;
const EMPTY_STRING: string = "";

export class EntryComponent extends Component {
  static observedAttributes = [TYPE_NAME, ABOUT_NAME, DURATION_NAME];

  private type: HTMLElement | null = null;
  private about: HTMLElement | null = null;
  private duration: HTMLElement | null = null;

  constructor() {
    super();
    this.loadTemplate("/components/entry/entry.html");
  }

  protected templateLoaded() {
    this.type = this.document.querySelector("#type");
    this.about = this.document.querySelector("#about");
    this.duration = this.document.querySelector("#duration");
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case TYPE_NAME:
        if (this.type) this.type.textContent = newValue;
        break;
      case ABOUT_NAME:
        if (this.about) this.about.textContent = newValue;
        break;
      case DURATION_NAME:
        const fullMinutes: number = parseInt(newValue);
        const hours: number = Math.floor(fullMinutes / ONE_HOUR_MINUTES);
        const minutes: number = fullMinutes - ONE_HOUR_MINUTES * hours;
        const hourString: string = `${hours} ${HOUR_STRING}`;
        const realhours: string = hours ? `${hourString}` : EMPTY_STRING;

        if (this.duration) {
          this.duration.textContent = `${realhours}  ${minutes}`;
        }
        break;
    }
  }
}
