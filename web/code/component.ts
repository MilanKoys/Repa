export class Component extends HTMLElement {
  constructor() {
    super();
  }

  protected async loadTemplate(templatePath: string) {
    const template = await fetch(templatePath).then((request) => {
      return request.text();
    });

    this.innerHTML = template;
  }
}
