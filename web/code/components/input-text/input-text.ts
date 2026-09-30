import { Component } from "../../component.js";

const LABEL_NAME: string = "label";
const PLACEHOLDER_NAME: string = "placeholder";
const TYPE_NAME: string = "type";
const INVALID_NAME: string = "invalid";
const LINK_TEXT_NAME: string = "link";
const LINK_HREF_NAME: string = "href";

const CHANGE_EVENT: string = "change";
const INPUT_EVENT: string = "input";

const EMPTY_STRING: string = "";

export class InputTextComponent extends Component {
  static observedAttributes = [
    LABEL_NAME,
    PLACEHOLDER_NAME,
    TYPE_NAME,
    LINK_TEXT_NAME,
    LINK_HREF_NAME,
    INVALID_NAME,
  ];

  private label: HTMLElement | null = null;
  private input: HTMLInputElement | null = null;
  private link: HTMLElement | null = null;

  constructor() {
    super();
  }

  private dispatchCustomEvent(name: string, options: CustomEventInit) {
    this.dispatchEvent(new CustomEvent(name, options));
  }

  private bindEvents() {
    if (this.input) {
      this.input.addEventListener(INPUT_EVENT, (event) => {
        const target: HTMLInputElement = event.target as HTMLInputElement;

        this.dispatchCustomEvent(CHANGE_EVENT, {
          detail: target.value,
        });
      });
    }
  }

  protected templateLoaded(): void {
    this.label = this.document.querySelector("#label");
    this.input = this.document.querySelector("#input");
    this.link = this.document.querySelector("#link");

    this.bindEvents();
  }

  connectedCallback() {
    this.loadTemplate("/components/input-text/input-text.html");
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case LABEL_NAME:
        if (this.label) this.label.textContent = newValue;
        break;
      case INVALID_NAME:
        if (this.input) this.input.setCustomValidity(newValue ?? EMPTY_STRING);
        break;
      case PLACEHOLDER_NAME:
        if (this.input) this.input.setAttribute(PLACEHOLDER_NAME, newValue);
        break;
      case TYPE_NAME:
        if (this.input) this.input.setAttribute(TYPE_NAME, newValue);
        break;
      case LINK_TEXT_NAME:
        if (this.link) this.link.textContent = newValue;
        break;
      case LINK_HREF_NAME:
        if (this.link) this.link.setAttribute(LINK_HREF_NAME, newValue);
        break;
    }
  }
}
