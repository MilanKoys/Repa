import { Component } from "../../component.js";

const WEEK_TEXT_NAME: string = "week";
const DATE_TEXT_NAME: string = "date";
const ACTIVE_TEXT_NAME: string = "active";
const STATUS_TEXT_NAME: string = "status";

const ACTIVE_BACKGROUND_CLASS: string = "bg-indigo-100";
const ACTIVE_BORDER_CLASS: string = "border-indigo-400";
const INACTIVE_BACKGROUND_CLASS: string = "bg-white";
const INACTIVE_BORDER_CLASS: string = "border-slate-200";

const ACTIVATE_CLASS_LIST: string[] = [
  ACTIVE_BACKGROUND_CLASS,
  ACTIVE_BORDER_CLASS,
  INACTIVE_BACKGROUND_CLASS,
  INACTIVE_BORDER_CLASS,
];

const STATUS_DEFAULT_CLASS: string = "bg-slate-300";
const STATUS_DRAFT_CLASS: string = "bg-indigo-400";
const STATUS_SUBMITTED_CLASS: string = "bg-orange-400";
const STATUS_APPROVED_CLASS: string = "bg-green-500";
const STATUS_REJECTED_CLASS: string = "bg-red-400";
const STATUS_CLASS_LIST: string[] = [
  STATUS_DEFAULT_CLASS,
  STATUS_DRAFT_CLASS,
  STATUS_SUBMITTED_CLASS,
  STATUS_REJECTED_CLASS,
  STATUS_APPROVED_CLASS,
];

export enum LeafStatus {
  Empty = "empty",
  Draft = "draft",
  Submitted = "submitted",
  Approved = "approved",
  Rejected = "rejected",
}

export class LeafComponent extends Component {
  static observedAttributes = [
    WEEK_TEXT_NAME,
    DATE_TEXT_NAME,
    ACTIVE_TEXT_NAME,
    STATUS_TEXT_NAME,
  ];

  private week: HTMLElement | null = null;
  private date: HTMLInputElement | null = null;
  private shell: HTMLInputElement | null = null;
  private status: HTMLInputElement | null = null;

  constructor() {
    super();
    this.loadTemplate("/components/leaf/leaf.html");
  }

  private setStatus(newStatus: LeafStatus) {
    const statusElement = this.status;

    if (statusElement) {
      STATUS_CLASS_LIST.forEach((className) => {
        statusElement.classList.remove(className);
      });

      switch (newStatus) {
        case LeafStatus.Draft:
          statusElement.classList.add(STATUS_DRAFT_CLASS);
          break;
        case LeafStatus.Submitted:
          statusElement.classList.add(STATUS_SUBMITTED_CLASS);
          break;
        case LeafStatus.Approved:
          statusElement.classList.add(STATUS_APPROVED_CLASS);
          break;
        case LeafStatus.Rejected:
          statusElement.classList.add(STATUS_REJECTED_CLASS);
          break;
        default:
          statusElement.classList.add(STATUS_DEFAULT_CLASS);
          break;
      }
    }
  }

  private toggleActive(toggle: boolean) {
    const shellElement = this.shell;
    if (shellElement) {
      ACTIVATE_CLASS_LIST.forEach((className) => {
        shellElement.classList.remove(className);
      });

      if (toggle) {
        shellElement.classList.add(ACTIVE_BORDER_CLASS);
        shellElement.classList.add(ACTIVE_BACKGROUND_CLASS);
      } else {
        shellElement.classList.add(INACTIVE_BORDER_CLASS);
        shellElement.classList.add(INACTIVE_BACKGROUND_CLASS);
      }
    }
  }

  protected async templateLoaded() {
    this.week = this.document.querySelector("#week");
    this.date = this.document.querySelector("#date");
    this.shell = this.document.querySelector("#shell");
    this.status = this.document.querySelector("#status");
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case WEEK_TEXT_NAME:
        if (this.week) this.week.textContent = newValue;
        break;
      case DATE_TEXT_NAME:
        if (this.date) this.date.textContent = newValue;
        break;
      case ACTIVE_TEXT_NAME:
        this.toggleActive(!!newValue);
        break;
      case STATUS_TEXT_NAME:
        this.setStatus(newValue as LeafStatus);
        break;
    }
  }
}
