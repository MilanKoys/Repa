import { Component, type ElementSignal } from "../../component.js";
import type { Route } from "../../route.js";
import {
  AuthentificationService,
  Role,
} from "../../services/authentification.js";
import { NavigationService } from "../../services/navigation.js";

interface MenuItem {
  label: string;
  path: string;
}

interface Menu {
  role: Role;
  items: MenuItem[];
}

const MENU_ITEM_SELECTOR: string = "menu-item-component";
const MENU_ITEM_LABEL: string = "label";
const MENU_ITEM_ACTIVE: string = "active";

const EMPTY_STRING: string = "";

const CLICK_EVENT: string = "click";

const HIDDEN_CLASS: string = "hidden";

const VISIBLE_NAME: string = "visible";
const TRUE_VALUE: string = "true";

const HOME_ROUTE: string = "home";
const USER_LIST_ROUTE: string = "user-list";

const HOME_LABEL: string = "Dashboard";
const USER_LIST_LABEL: string = "Users";

const MENU_ROUTE_LIST: string[] = [HOME_ROUTE, USER_LIST_ROUTE];

const MENU_ROLE_LIST: Menu[] = [
  {
    role: Role.Admin,
    items: [
      {
        label: HOME_LABEL,
        path: HOME_ROUTE,
      },
      {
        label: USER_LIST_LABEL,
        path: USER_LIST_ROUTE,
      },
    ],
  },
];

export class MenuComponent extends Component {
  static observedAttributes = [VISIBLE_NAME];

  private navigationService: NavigationService = NavigationService.inject();
  private authService = AuthentificationService.inject();

  private shell: ElementSignal<Element> = this.element("#shell");

  constructor() {
    super();
    this.loadTemplate("/components/menu/menu.html");
    this.navigationService.navigated((route: Route) => {
      if (MENU_ROUTE_LIST.includes(route.path)) {
        this.setAttribute(VISIBLE_NAME, TRUE_VALUE);
      } else {
        this.removeAttribute(VISIBLE_NAME);
      }

      this.renderMenu();
    });
  }

  private navigate(menuItem: MenuItem, menuList: Menu) {
    this.navigationService.navigate(menuItem.path);
  }

  private async renderMenu() {
    await this.initialized;

    const userProfile = await this.authService.loadUserProfile();

    if (!userProfile) return;

    const menuList = MENU_ROLE_LIST.find((menu) => {
      return menu.role === userProfile.role;
    });

    if (!menuList || !menuList.items.length) {
      return this.removeAttribute(VISIBLE_NAME);
    }

    this.shell().innerHTML = EMPTY_STRING;

    menuList.items.forEach((menuItem) => {
      const itemElement = document.createElement(MENU_ITEM_SELECTOR);
      itemElement.setAttribute(MENU_ITEM_LABEL, menuItem.label);

      itemElement.addEventListener(CLICK_EVENT, () => {
        this.navigate(menuItem, menuList);
      });

      if (menuItem.path === this.navigationService.route) {
        itemElement.setAttribute(MENU_ITEM_ACTIVE, TRUE_VALUE);
      }

      this.shell().appendChild(itemElement);
    });
  }

  async attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
  ) {
    await this.initialized;

    switch (name) {
      case VISIBLE_NAME:
        if (newValue) {
          this.shell().classList.remove(HIDDEN_CLASS);
        } else {
          this.shell().classList.add(HIDDEN_CLASS);
        }
        break;
    }
  }
}
