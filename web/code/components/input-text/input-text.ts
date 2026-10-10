import { Component, type ElementSignal } from "../../component.js";

const LABEL_NAME: string = "label";
const PLACEHOLDER_NAME: string = "placeholder";
const TYPE_NAME: string = "type";
const INVALID_NAME: string = "invalid";
const LINK_TEXT_NAME: string = "link";
const LINK_HREF_NAME: string = "href";
const UPPERCASE_NAME: string = "uppercase";

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
    UPPERCASE_NAME,
  ];

  private label: ElementSignal<Element> = this.element("#label");
  private input: ElementSignal<HTMLInputElement> = this.element("#input");
  private link: ElementSignal<Element> = this.element("#link");
  private error: ElementSignal<Element> = this.element("#error");

  public validationMessage: string = "";

  constructor() {
    super();
  }

  private dispatchCustomEvent(name: string, options: CustomEventInit) {
    this.dispatchEvent(new CustomEvent(name, options));
  }

  protected renderError(errorMessage: string) {
    if (errorMessage.length) {
      this.error().textContent = errorMessage;
    } else {
      this.error().textContent = null;
    }
  }

  private bindEvents() {
    this.input().addEventListener(CHANGE_EVENT, (event) => {
      const target: HTMLInputElement = event.target as HTMLInputElement;
      this.validationMessage = target.validationMessage;
      this.renderError(target.validationMessage);
    });

    this.input().addEventListener(INPUT_EVENT, (event) => {
      const target: HTMLInputElement = event.target as HTMLInputElement;

      this.dispatchCustomEvent(CHANGE_EVENT, {
        detail: target.value,
      });
    });
  }

  protected templateLoaded(): void {
    this.bindEvents();
  }

  connectedCallback() {
    this.loadTemplate("/components/input-text/input-text.html");
  }

  public clear() {
    this.input().value = EMPTY_STRING;
  }

  public setValue(value: string) {
    this.input().value = value;
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
      case INVALID_NAME:
        this.input().setCustomValidity(newValue ?? EMPTY_STRING);
        this.error().textContent = this.input().validationMessage;
        break;
      case PLACEHOLDER_NAME:
        this.input().setAttribute(PLACEHOLDER_NAME, newValue);
        break;
      case TYPE_NAME:
        this.input().setAttribute(TYPE_NAME, newValue);
        break;
      case LINK_TEXT_NAME:
        this.link().textContent = newValue;
        break;
      case LINK_HREF_NAME:
        this.link().setAttribute(LINK_HREF_NAME, newValue);
        break;
      case UPPERCASE_NAME:
        if (newValue) {
          this.input().classList.add(UPPERCASE_NAME);
        } else {
          this.input().classList.remove(UPPERCASE_NAME);
        }
        break;
    }
  }
}
