import type { Route } from "../route.js";

import { routes } from "../route.js";

type Undefined<T> = undefined | T;
type Nullable<T> = null | T;

const EMPTY_STRING: string = "";

const HOME_ROUTE: string = "home";

export class NavigationService {
  private static instance: Undefined<NavigationService>;

  public register: (element: HTMLElement) => void = () => {};

  public registeredElement: Promise<HTMLElement> = new Promise((resolve) => {
    this.register = resolve;
  });

  private readonly routes: Route[] = routes;

  protected route: string = HOME_ROUTE;

  private constructor() {
    this.navigate(this.route);
  }

  public async navigate(routePath: string) {
    const navigationElement = await this.registeredElement;
    navigationElement.innerHTML = EMPTY_STRING;
    const route = this.routes.find((route) => route.path === routePath);
    if (!route) return;
    const routeElement = document.createElement(route.selector);
    navigationElement.appendChild(routeElement);
  }

  public static inject() {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }

    return NavigationService.instance;
  }
}
