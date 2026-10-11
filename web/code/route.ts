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
  {
    path: "user-list",
    selector: "user-list-component",
  },
  {
    path: "review-queue",
    selector: "review-queue-component",
  },
];
