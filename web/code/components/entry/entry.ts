import { Component, type ElementSignal } from "../../component.js";
import type { InputTextComponent } from "../input-text/input-text.js";

const TYPE_NAME: string = "type";
const ABOUT_NAME: string = "about";
const DURATION_NAME: string = "duration";
const READONLY_NAME: string = "readonly";
const REVIEW_NAME: string = "review";

const HOUR_STRING: string = "h";
const ONE_HOUR_MINUTES: number = 60;
const EMPTY_STRING: string = "";

const HIDDEN_CLASS: string = "hidden";
const CURSOR_CLASS: string = "cursor-pointer";
const HOVER_CLASS: string = "hover:bg-indigo-200";

const REMOVE_COMMENT_TEXT: string = "Remove";
const ADD_COMMENT_TEXT: string = "Comment";

const CLICK_EVENT: string = "click";
const CHANGE_EVENT: string = "change";

export class EntryComponent extends Component {
  static observedAttributes = [
    TYPE_NAME,
    ABOUT_NAME,
    DURATION_NAME,
    READONLY_NAME,
    REVIEW_NAME,
  ];

  private type: ElementSignal<Element> = this.element("#type");
  private about: ElementSignal<Element> = this.element("#about");
  private duration: ElementSignal<Element> = this.element("#duration");
  private shell: ElementSignal<Element> = this.element("#shell");
  private comment: ElementSignal<Element> = this.element("#comment");
  private commentInput: ElementSignal<InputTextComponent> =
    this.element("#comment_input");
  private commentText: ElementSignal<Element> = this.element("#comment_text");

  private commentable: boolean = false;

  constructor() {
    super();
    this.loadTemplate("/components/entry/entry.html");
  }

  private dispatchCustomEvent(name: string, options: CustomEventInit) {
    this.dispatchEvent(new CustomEvent(name, options));
  }

  private bindComment() {
    this.comment().addEventListener(CLICK_EVENT, () => {
      this.commentable = !this.commentable;

      this.commentInput().addEventListener(CHANGE_EVENT, (event: Event) => {
        const customEvent: CustomEvent = event as CustomEvent;
        this.dispatchCustomEvent(CHANGE_EVENT, {
          detail: customEvent.detail,
        });
      });

      if (this.commentable) {
        this.commentText().textContent = REMOVE_COMMENT_TEXT;
        this.commentInput().classList.remove(HIDDEN_CLASS);
      } else {
        this.commentText().textContent = ADD_COMMENT_TEXT;
        this.commentInput().classList.add(HIDDEN_CLASS);
        this.commentInput().clear();
      }
    });
  }

  protected templateLoaded() {
    this.bindComment();
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
      case REVIEW_NAME:
        if (newValue) {
          this.comment().classList.remove(HIDDEN_CLASS);
        } else {
          this.comment().classList.add(HIDDEN_CLASS);
        }
        break;
      case READONLY_NAME:
        if (newValue) {
          this.shell().classList.remove(CURSOR_CLASS);
          this.shell().classList.remove(HOVER_CLASS);
        } else {
          this.shell().classList.add(CURSOR_CLASS);
          this.shell().classList.add(HOVER_CLASS);
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
