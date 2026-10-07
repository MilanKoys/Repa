import { Component } from "../../component.js";
import type { InputTextComponent } from "../input-text/input-text.js";

const HIDDEN_CLASS: string = "hidden";

const CLICK_EVENT: string = "click";
const CHANGE_EVENT: string = "change";
const SUBMIT_EVENT: string = "submit";

const EMPTY_STRING: string = "";

const OPEN_NAME: string = "open";

export class DetailComponent extends Component {
  static observedAttributes = [OPEN_NAME];

  private content: HTMLElement | null = null;
  private close: HTMLElement | null = null;
  private cancel: HTMLElement | null = null;
  private submit: HTMLElement | null = null;
  private error: HTMLElement | null = null;

  private typeInput: InputTextComponent | null = null;
  private durationInput: InputTextComponent | null = null;
  private aboutInput: InputTextComponent | null = null;

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
        this.error.textContent = text;
        this.error.classList.remove(HIDDEN_CLASS);
      } else {
        this.error.textContent = EMPTY_STRING;
        this.error.classList.add(HIDDEN_CLASS);
      }
    }
  }

  private bindEvents() {
    this.bindDetail(this.typeInput, (value) => (this.type = value));
    this.bindDetail(this.durationInput, (value) => (this.duration = value));
    this.bindDetail(this.aboutInput, (value) => (this.about = value));

    if (this.close) {
      this.close.addEventListener(CLICK_EVENT, () => this.closeContent());
    }

    if (this.cancel) {
      this.cancel.addEventListener(CLICK_EVENT, () => this.closeContent());
    }

    if (this.submit) {
      this.submit.addEventListener(CLICK_EVENT, () => {
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
  }

  protected templateLoaded() {
    this.typeInput = this.document.querySelector("#type");
    this.durationInput = this.document.querySelector("#duration");
    this.aboutInput = this.document.querySelector("#about");
    this.content = this.document.querySelector("#content");
    this.close = this.document.querySelector("#close");
    this.cancel = this.document.querySelector("#cancel");
    this.submit = this.document.querySelector("#submit");
    this.error = this.document.querySelector("#error");

    this.bindEvents();
  }

  public reset() {
    this.toggleError();
    if (this.typeInput) this.typeInput.clear();
    if (this.durationInput) this.durationInput.clear();
    if (this.aboutInput) this.aboutInput.clear();

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
      case OPEN_NAME:
        if (this.content) {
          if (newValue) {
            this.content.classList.remove(HIDDEN_CLASS);
          } else {
            this.content.classList.add(HIDDEN_CLASS);
          }
        }
        break;
    }
  }
}
