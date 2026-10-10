import { Component, type ElementSignal } from "../../component.js";

const TYPE_NAME: string = "type";
const ABOUT_NAME: string = "about";
const DURATION_NAME: string = "duration";
const READONLY_NAME: string = "readonly";

const HOUR_STRING: string = "h";
const ONE_HOUR_MINUTES: number = 60;
const EMPTY_STRING: string = "";

const CURSOR_CLASS: string = "cursor-pointer";

export class EntryComponent extends Component {
  static observedAttributes = [
    TYPE_NAME,
    ABOUT_NAME,
    DURATION_NAME,
    READONLY_NAME,
  ];

  private type: ElementSignal<Element> = this.element("#type");
  private about: ElementSignal<Element> = this.element("#about");
  private duration: ElementSignal<Element> = this.element("#duration");
  private shell: ElementSignal<Element> = this.element("#shell");

  constructor() {
    super();
    this.loadTemplate("/components/entry/entry.html");
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case TYPE_NAME:
        this.type().textContent = newValue;
        break;
      case ABOUT_NAME:
        this.about().textContent = newValue;
        break;
      case READONLY_NAME:
        if (newValue) {
          this.shell().classList.remove(CURSOR_CLASS);
        } else {
          this.shell().classList.add(CURSOR_CLASS);
        }
        break;
      case DURATION_NAME:
        const fullMinutes: number = parseInt(newValue);
        const hours: number = Math.floor(fullMinutes / ONE_HOUR_MINUTES);
        const minutes: number = fullMinutes - ONE_HOUR_MINUTES * hours;
        const hourString: string = `${hours} ${HOUR_STRING}`;
        const realhours: string = hours ? `${hourString}` : EMPTY_STRING;

        this.duration().textContent = `${realhours}  ${minutes}`;
        break;
    }
  }
}
