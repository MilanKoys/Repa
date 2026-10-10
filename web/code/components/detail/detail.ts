import { Component, type ElementSignal } from "../../component.js";
import type { InputTextComponent as InputText } from "../input-text/input-text.js";

const HIDDEN_CLASS: string = "hidden";

const CLICK_EVENT: string = "click";
const CHANGE_EVENT: string = "change";
const SUBMIT_EVENT: string = "submit";
const DELETE_EVENT: string = "delete";

const EMPTY_STRING: string = "";

const IDENTIFIER_NAME: string = "identifier";
const OPEN_NAME: string = "open";
const DATE_NAME: string = "date";
const WEEK_NAME: string = "week";

const EDIT_HEADER: string = "Edit class";
const ADD_HEADER: string = "Add class";

export class DetailComponent extends Component {
  static observedAttributes = [
    OPEN_NAME,
    IDENTIFIER_NAME,
    DATE_NAME,
    WEEK_NAME,
  ];

  private content: ElementSignal<Element> = this.element("#content");
  private close: ElementSignal<Element> = this.element("#close");
  private cancel: ElementSignal<Element> = this.element("#cancel");
  private submit: ElementSignal<Element> = this.element("#submit");
  private error: ElementSignal<Element> = this.element("#error");
  private delete: ElementSignal<Element> = this.element("#delete");
  private header: ElementSignal<Element> = this.element("#header");
  private date: ElementSignal<Element> = this.element("#date");
  private week: ElementSignal<Element> = this.element("#week");

  private typeInput: ElementSignal<InputText> = this.element("#type");
  private durationInput: ElementSignal<InputText> = this.element("#duration");
  private aboutInput: ElementSignal<InputText> = this.element("#about");

  private type: string = "";
  private duration: string = "";
  private about: string = "";

  private async bindDetail(
    element: Element | null,
    callback: (value: string) => void,
  ) {
    if (element) {
      element.addEventListener(CHANGE_EVENT, (event: Event) => {
        const customEvent: CustomEvent = event as CustomEvent;
        callback(customEvent.detail);
      });
    }
  }

  constructor() {
    super();
    this.loadTemplate("/components/detail/detail.html");
  }

  private closeContent() {
    this.removeAttribute(OPEN_NAME);
    this.reset();
  }

  private dispatchCustomEvent(name: string, options: CustomEventInit) {
    this.dispatchEvent(new CustomEvent(name, options));
  }

  private toggleError(text?: string) {
    if (this.error) {
      if (text) {
        this.error().textContent = text;
        this.error().classList.remove(HIDDEN_CLASS);
      } else {
        this.error().textContent = EMPTY_STRING;
        this.error().classList.add(HIDDEN_CLASS);
      }
    }
  }

  private bindEvents() {
    this.bindDetail(this.typeInput(), (value) => (this.type = value));
    this.bindDetail(this.durationInput(), (value) => (this.duration = value));
    this.bindDetail(this.aboutInput(), (value) => (this.about = value));

    this.close().addEventListener(CLICK_EVENT, () => this.closeContent());

    this.cancel().addEventListener(CLICK_EVENT, () => this.closeContent());

    this.delete().addEventListener(CLICK_EVENT, () => {
      this.dispatchCustomEvent(DELETE_EVENT, {
        detail: this.getAttribute(IDENTIFIER_NAME),
      });
      this.closeContent();
    });

    this.submit().addEventListener(CLICK_EVENT, () => {
      this.toggleError();

      const type: string = this.type;
      const duration: string = this.duration;
      const about: string = this.about;

      if (!type.length) {
        return this.toggleError("Enter the class abbreviation.");
      }

      if (!duration.length) {
        return this.toggleError("Enter how long the class took.");
      }

      this.dispatchCustomEvent(SUBMIT_EVENT, {
        detail: { type, duration, about },
      });

      this.closeContent();
    });
  }

  protected templateLoaded() {
    this.bindEvents();
  }

  public setDetail(type: string, about: string, duration: string) {
    this.typeInput().setValue(type);
    this.durationInput().setValue(duration);
    this.aboutInput().setValue(about);

    this.type = type;
    this.duration = duration;
    this.about = about;
  }

  public reset() {
    this.toggleError();
    this.typeInput().clear();
    this.durationInput().clear();
    this.aboutInput().clear();
    this.removeAttribute(IDENTIFIER_NAME);

    this.type = EMPTY_STRING;
    this.duration = EMPTY_STRING;
    this.about = EMPTY_STRING;
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case WEEK_NAME:
        this.week().textContent = newValue;
        break;
      case DATE_NAME:
        this.date().textContent = newValue;
        break;
      case OPEN_NAME:
        if (newValue) {
          this.content().classList.remove(HIDDEN_CLASS);
        } else {
          this.content().classList.add(HIDDEN_CLASS);
        }
        break;
      case IDENTIFIER_NAME:
        if (newValue) {
          this.delete().classList.remove(HIDDEN_CLASS);
          this.header().textContent = EDIT_HEADER;
        } else {
          this.delete().classList.add(HIDDEN_CLASS);
          this.header().textContent = ADD_HEADER;
        }
        break;
    }
  }
}
