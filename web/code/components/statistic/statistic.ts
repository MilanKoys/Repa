import { Component, type ElementSignal } from "../../component.js";

const TEXT_NAME: string = "text";
const HEADER_NAME: string = "header";

export class StatisticComponent extends Component {
  static observedAttributes = [TEXT_NAME, HEADER_NAME];

  private shell: ElementSignal<Element> = this.element("#shell");
  private header: ElementSignal<Element> = this.element("#header");
  private text: ElementSignal<Element> = this.element("#text");

  constructor() {
    super();
    this.loadTemplate("/components/statistic/statistic.html");
  }

  protected async templateLoaded() {}

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case TEXT_NAME:
        this.text().textContent = newValue;
        break;
      case HEADER_NAME:
        this.header().textContent = newValue;
        break;
    }
  }
}
