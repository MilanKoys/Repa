const STYLE_SHEET_HREF: string = "/styles.css";
const STYLE_SHEET_TYPE: string = "stylesheet";
const LINK_ELEMENT: "link" = "link";
const SHADOW_MODE_OPEN: "open" = "open";
const TEMPLATE_ELEMENT: "template" = "template";

type TemplateMap = Map<string, Promise<HTMLTemplateElement>>;
type TemplatePromise = Promise<HTMLTemplateElement>;

export class Component extends HTMLElement {
  private static templates: TemplateMap = new Map();

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

  private static async fetchTemplate(templatePath: string): TemplatePromise {
    const response: Response = await fetch(templatePath);
    if (!response.ok) throw new Error(`Failed to load ${templatePath}`);

    const template = document.createElement(TEMPLATE_ELEMENT);
    template.innerHTML = await response.text();

    return template;
  }

  private static getTemplate(templatePath: string): TemplatePromise {
    let template = Component.templates.get(templatePath);

    if (!template) {
      template = Component.fetchTemplate(templatePath).catch((error) => {
        Component.templates.delete(templatePath);
        throw error;
      });

      Component.templates.set(templatePath, template);
    }

    return template;
  }

  protected async loadTemplate(templatePath: string) {
    const template = await Component.getTemplate(templatePath);

    this.document.appendChild(template.content.cloneNode(true));
    this.initialize();
    this.templateLoaded();
  }

  protected templateLoaded() {}
}
