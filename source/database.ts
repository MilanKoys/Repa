import type { Collection, Db, Document } from "mongodb";
import type { Undefined, VoidMethod } from "@types";

import { MongoClient } from "mongodb";

const NOT_CONNECTED_MESSAGE: string =
  "Database is not connected, call connect() first";

export class Database {
  private static instance: Undefined<Database>;

  private client: Undefined<MongoClient>;
  private db: Undefined<Db>;
  private connecting: Undefined<Promise<Db>>;

  private constructor() {}

  public static init(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }

  private getDb(): Db {
    if (!this.db) throw new Error(NOT_CONNECTED_MESSAGE);
    return this.db;
  }

  private async openConnection(uri: string, name: string): Promise<Db> {
    const client: MongoClient = new MongoClient(uri);
    await client.connect();

    this.client = client;
    this.db = client.db(name);

    return this.db;
  }

  public connect(
    uri: string,
    name: string,
    callback?: VoidMethod,
  ): Promise<Db> {
    if (!this.connecting) {
      this.connecting = this.openConnection(uri, name).catch((error) => {
        this.connecting = undefined;
        throw error;
      });
    }

    return this.connecting.then((db: Db) => {
      if (callback) callback();
      return db;
    });
  }

  public collection<T extends Document>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  public async close(): Promise<void> {
    if (!this.client) return;

    await this.client.close();
    this.client = undefined;
    this.db = undefined;
    this.connecting = undefined;
  }
}
