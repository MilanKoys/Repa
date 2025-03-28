import { Collection } from "mongodb";
import { Session, User } from "../../contracts";
import { db } from "../../database";
import { Nullable } from "../../types";

const database = db();
export async function userFromToken(token?: string): Promise<Nullable<User>> {
  if (!token) {
    return null;
  }

  const sessions: Collection<Session> = database.collection("sessions");
  const users: Collection<User> = database.collection("users");
  const session = await sessions.findOne({ token });
  if (!session) {
    return null;
  }

  const user = await users.findOne({ id: session.id });
  if (!user) {
    return null;
  }

  return user;
}
