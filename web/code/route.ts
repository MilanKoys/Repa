export interface Route {
  path: string;
  selector: string;
}

export const routes: Route[] = [
  {
    path: "home",
    selector: "dashboard-component",
  },
  {
    path: "attendance",
    selector: "record-component",
  },
];
