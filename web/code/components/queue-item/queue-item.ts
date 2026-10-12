import { Component, type ElementSignal } from "../../component.js";

const NAME_NAME: string = "name";
const CLASS_NAME: string = "class";

export class QueueItemComponent extends Component {
  static observedAttributes = [NAME_NAME, CLASS_NAME];

  private shell: ElementSignal<Element> = this.element("#shell");
  private avatar: ElementSignal<Element> = this.element("#avatar");
  private name: ElementSignal<Element> = this.element("#name");
  private class: ElementSignal<Element> = this.element("#class");
  private review: ElementSignal<Element> = this.element("#review");

  constructor() {
    super();
    this.loadTemplate("/components/queue-item/queue-item.html");
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
        break;
      case CLASS_NAME:
        this.class().textContent = newValue;
        break;
    }
  }
}
