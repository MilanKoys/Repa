import { Db, MongoClient } from "mongodb";
import { Nullable } from "./types";
import { config } from "./config";

let database: Nullable<Db> = null;

export function db() {
  if (!database) {
    database = new MongoClient(config.databaseConnectionString).db(
      config.databaseName
    );
  }

  return database;
}
