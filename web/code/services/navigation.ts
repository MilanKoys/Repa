import type { Route } from "../route.js";

import { routes } from "../route.js";

type Undefined<T> = undefined | T;
type Nullable<T> = null | T;

type NavigationListener = (route: Route) => void;

const EMPTY_STRING: string = "";

const HOME_ROUTE: string = "home";

export class NavigationService {
  private static instance: Undefined<NavigationService>;

  private navigateListeners: NavigationListener[] = [];

  public register: (element: HTMLElement) => void = () => {};

  public registeredElement: Promise<HTMLElement> = new Promise((resolve) => {
    this.register = resolve;
  });

  private readonly routes: Route[] = routes;

  public route: string = HOME_ROUTE;

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
    this.navigateListeners.forEach((listener) => listener(route));
  }

  public navigated(callback: NavigationListener) {
    this.navigateListeners.push(callback);
  }

  public static inject() {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }

    return NavigationService.instance;
  }
}
