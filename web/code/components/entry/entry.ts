import { Component } from "../../component.js";

const HIDDEN_CLASS: string = "hidden";

const CLICK_EVENT: string = "click";
const CHANGE_EVENT: string = "change";

const OPEN_NAME: string = "open";

export class EntryComponent extends Component {
  static observedAttributes = [OPEN_NAME];

  private content: HTMLElement | null = null;
  private close: HTMLElement | null = null;
  private cancel: HTMLElement | null = null;
  private submit: HTMLElement | null = null;

  private typeInput: HTMLElement | null = null;
  private durationInput: HTMLElement | null = null;
  private aboutInput: HTMLElement | null = null;

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
    this.loadTemplate("/components/entry/entry.html");
  }

  private closeContent() {
    this.removeAttribute(OPEN_NAME);
  }

  private dispatchCustomEvent(name: string, options: CustomEventInit) {
    this.dispatchEvent(new CustomEvent(name, options));
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
        const type: string = this.type;
        const duration: string = this.duration;
        const about: string = this.about;

        this.dispatchCustomEvent(CHANGE_EVENT, {
          detail: { type, duration, about },
        });
      });
    }
  }

  protected templateLoaded() {
    this.content = this.document.querySelector("#content");
    this.close = this.document.querySelector("#close");
    this.cancel = this.document.querySelector("#cancel");
    this.typeInput = this.document.querySelector("#type");
    this.durationInput = this.document.querySelector("#duration");
    this.aboutInput = this.document.querySelector("#about");
    this.submit = this.document.querySelector("#submit");

    this.bindEvents();
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
