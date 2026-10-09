const STYLE_SHEET_HREF: string = "/styles.css";
const SHADOW_MODE_OPEN: "open" = "open";
const TEMPLATE_ELEMENT: "template" = "template";

type Undefined<T> = undefined | T;
type TemplateMap = Map<string, Promise<HTMLTemplateElement>>;
type TemplatePromise = Promise<HTMLTemplateElement>;
export type ElementSignal<T> = () => T;

export class Component extends HTMLElement {
  private static templates: TemplateMap = new Map();
  private static styleSheet: CSSStyleSheet = new CSSStyleSheet();
  private static styleSheetLoaded: Undefined<Promise<void>>;

  private initialize: () => void = () => {};

  protected document: ShadowRoot;

  protected initialized: Promise<void> = new Promise((resolve) => {
    this.initialize = resolve;
  });

  constructor() {
    super();

    this.document = this.attachShadow({ mode: SHADOW_MODE_OPEN });
    this.document.adoptedStyleSheets = [Component.styleSheet];
  }

  private static async fetchStyles(): Promise<void> {
    const response: Response = await fetch(STYLE_SHEET_HREF);
    if (!response.ok) throw new Error(`Failed to load ${STYLE_SHEET_HREF}`);

    const styles: string = await response.text();

    await Component.styleSheet.replace(styles);
  }

  private static loadStyleSheet(): Promise<void> {
    if (!Component.styleSheetLoaded) {
      Component.styleSheetLoaded = Component.fetchStyles();
    }

    return Component.styleSheetLoaded;
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

  protected element<T>(selector: string): ElementSignal<T> {
    return () => {
      const element = this.document.querySelector(selector) as T;
      if (!element) throw new Error(`Can't select element ${selector}!`);
      return element;
    };
  }

  protected async loadTemplate(templatePath: string) {
    const template = await Component.getTemplate(templatePath);

    await Component.loadStyleSheet();

    this.document.appendChild(template.content.cloneNode(true));
    this.initialize();
    this.templateLoaded();
  }

  protected templateLoaded() {}
}
