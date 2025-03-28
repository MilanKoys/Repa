import { Collection } from "mongodb";
import { Session, User } from "../../contracts";
import { Nullable } from "../../types";
import { db } from "../../database";
import { nanoid } from "nanoid";

const database = db();

export async function generateSession(user: User): Promise<Nullable<string>> {
  const sessions: Collection<Session> = database.collection("sessions");
  const token: string = nanoid();
  const result = await sessions.insertOne({
    token,
    id: user.id,
    created: new Date().getTime(),
  });

  if (!result.acknowledged) return null;
  return token;
}
