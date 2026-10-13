import { Component, type ElementSignal } from "../../component.js";

const NAME_NAME: string = "name";
const CLASS_NAME: string = "class-name";
const LAST_NAME: string = "last";
const WEEK_NAME: string = "week";

const FIRST_INDEX: number = 0;
const LAST_INDEX: number = 1;

const NAME_DELIMITER: string = " ";

const BORDER_BOTTOM_CLASS: string = "border-b";

export class QueueItemComponent extends Component {
  static observedAttributes = [NAME_NAME, CLASS_NAME, LAST_NAME, WEEK_NAME];

  private shell: ElementSignal<Element> = this.element("#shell");
  private avatar: ElementSignal<Element> = this.element("#avatar");
  private name: ElementSignal<Element> = this.element("#name");
  private class: ElementSignal<Element> = this.element("#class");
  private review: ElementSignal<Element> = this.element("#review");
  private week: ElementSignal<Element> = this.element("#week");

  constructor() {
    super();
    this.loadTemplate("/components/queue-item/queue-item.html");
  }

  private setAvatarName(name: string) {
    const splitName = name.split(NAME_DELIMITER);
    const firstName = splitName[FIRST_INDEX];
    const lastName = splitName[LAST_INDEX];
    if (firstName && lastName) {
      const firstLetter: string = firstName.slice(FIRST_INDEX, LAST_INDEX);
      const LastLetter: string = lastName.slice(FIRST_INDEX, LAST_INDEX);
      const avatarName = `${firstLetter}${LastLetter}`;
      this.avatar().textContent = avatarName;
    }
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case NAME_NAME:
        this.name().textContent = newValue;
        this.setAvatarName(newValue);
        break;
      case WEEK_NAME:
        this.week().textContent = newValue;
        break;
      case CLASS_NAME:
        this.class().textContent = newValue;
        break;
      case LAST_NAME:
        this.shell().classList.remove(BORDER_BOTTOM_CLASS);
        break;
    }
  }
}
