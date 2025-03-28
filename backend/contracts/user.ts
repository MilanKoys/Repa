export enum Roles {
  Admin,
}

export interface User {
  id: string;
  email: string;
  password: string;
  created: number;
  roles: Roles[];
}
