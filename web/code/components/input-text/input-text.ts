import { Component } from "../../component.js";

const LABEL_NAME: string = "label";
const PLACEHOLDER_NAME: string = "placeholder";
const TYPE_NAME: string = "type";
const LINK_TEXT_NAME: string = "link";
const LINK_HREF_NAME: string = "href";

export class InputTextComponent extends Component {
  static observedAttributes = [
    LABEL_NAME,
    PLACEHOLDER_NAME,
    TYPE_NAME,
    LINK_TEXT_NAME,
    LINK_HREF_NAME,
  ];

  private label: HTMLElement | null = null;
  private input: HTMLElement | null = null;
  private link: HTMLElement | null = null;

  constructor() {
    super();
  }

  protected templateLoaded(): void {
    this.label = this.document.querySelector("#label");
    this.input = this.document.querySelector("#input");
    this.link = this.document.querySelector("#link");
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
