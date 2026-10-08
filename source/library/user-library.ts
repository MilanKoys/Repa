import type { Token, Undefined, User } from "@types";
import type { Collection } from "mongodb";

import { Database } from "#database";
import { Collections, Role } from "#enums";
import { Session } from "#session";

const USERS_COLLECTION: Collections = Collections.Users;

export class UserLibrary {
  private static instance: Undefined<UserLibrary>;
  private session: Session = Session.init();
  private database: Database = Database.init();

  private constructor() {}

  public async sessionUser(token: Token): Promise<Undefined<User>> {
    const users: Collection<User> = this.database.collection(USERS_COLLECTION);

    const foundUser = await users.findOne({ email: token.email });

    if (!foundUser) return;

    return foundUser;
  }

  public verifyRoles(user: User, roles: Role[]) {
    return roles.some((role) => user.role === role);
  }

  public async cookiesUser(
    cookies: Undefined<string>,
  ): Promise<Undefined<User>> {
    if (!cookies) return;

    const sessionToken = this.session.parseSessionCookie(cookies);

    if (!sessionToken) return;

    const user: Undefined<User> = await this.sessionUser(sessionToken);

    if (!user) return;

    const verify = this.session.verifySession(user, sessionToken);

    if (!verify) return;

    return user;
  }

  public static inject() {
    if (!UserLibrary.instance) {
      UserLibrary.instance = new UserLibrary();
    }

    return UserLibrary.instance;
  }
}
