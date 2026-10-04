const STYLE_SHEET_HREF: string = "/styles.css";
const STYLE_SHEET_TYPE: string = "stylesheet";
const LINK_ELEMENT: "link" = "link";
const SHADOW_MODE_OPEN: "open" = "open";
const SHADOW_MODE_CLOSE: "closed" = "closed";

export class Component extends HTMLElement {
  private initialize: () => void = () => {};

  protected document: ShadowRoot;

  protected initialized: Promise<void> = new Promise((resolve) => {
    this.initialize = resolve;
  });

  constructor() {
    super();

    this.document = this.attachShadow({ mode: SHADOW_MODE_OPEN });
    this.loadStyles();
  }

  private loadStyles() {
    const link: HTMLLinkElement = document.createElement(LINK_ELEMENT);
    link.rel = STYLE_SHEET_TYPE;
    link.href = STYLE_SHEET_HREF;
    this.document.appendChild(link);
  }

  protected async loadTemplate(templatePath: string) {
    const template = await fetch(templatePath).then((request) => {
      return request.text();
    });

    this.document.innerHTML += template;
    this.initialize();
    this.templateLoaded();
  }

  protected templateLoaded() {}
}
