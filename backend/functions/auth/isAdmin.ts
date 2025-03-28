import { Roles, User } from "../../contracts";

export function isAdmin(user: User) {
  return user.roles.findIndex((r) => r === Roles.Admin) > -1;
}
