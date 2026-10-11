import { Component, type ElementSignal } from "../../component.js";

const LABEL_NAME: string = "label";
const ACTIVE_NAME: string = "active";

const ACTIVE_STATUS_CLASS: string = "bg-indigo-400";
const INACTIVE_STATUS_CLASS: string = "bg-indigo-400";

const ACTIVE_LABEL_CLASS: string = "text-black";
const INACTIVE_LABEL_CLASS: string = "text-slate-400";

const STATUS_CLASS_LIST: string[] = [
  ACTIVE_STATUS_CLASS,
  INACTIVE_STATUS_CLASS,
];

const LABEL_CLASS_LIST: string[] = [ACTIVE_LABEL_CLASS, INACTIVE_LABEL_CLASS];

export class MenuItemComponent extends Component {
  static observedAttributes = [LABEL_NAME, ACTIVE_NAME];

  private label: ElementSignal<Element> = this.element("#label");
  private status: ElementSignal<Element> = this.element("#status");

  constructor() {
    super();
    this.loadTemplate("/components/menu-item/menu-item.html");
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case LABEL_NAME:
        this.label().textContent = newValue;
        break;

      case ACTIVE_NAME:
        STATUS_CLASS_LIST.forEach((className) => {
          this.status().classList.remove(className);
        });
        LABEL_CLASS_LIST.forEach((className) => {
          this.label().classList.remove(className);
        });

        if (newValue) {
          this.label().classList.add(ACTIVE_LABEL_CLASS);
          this.status().classList.add(ACTIVE_STATUS_CLASS);
        } else {
          this.label().classList.add(INACTIVE_LABEL_CLASS);
          this.status().classList.add(INACTIVE_STATUS_CLASS);
        }
        break;
    }
  }
}
