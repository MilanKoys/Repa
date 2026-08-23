import { basePath } from "#helpers";
import type { Undefined } from "@types";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATABASE_PATH = "/database";

const databasePath: string = join(basePath(), DATABASE_PATH);

export class Database {
  private store: { [key: string]: Object[] } = {};

  constructor() {
    this.loadDatabase();
  }

  private loadDatabase() {
    const collectionsNames: string[] = readdirSync(databasePath);

    for (const collectionName of collectionsNames) {
      const collectionPath: string = join(databasePath, collectionName);
      this.store[collectionName] = JSON.parse(
        readFileSync(collectionPath, "utf-8"),
      );
    }
  }

  private writeDatabase() {
    for (const collectionName of Object.keys(this.store)) {
      const collectionPath: string = join(databasePath, collectionName);
      writeFileSync(
        collectionPath,
        JSON.stringify(this.store[collectionName]),
        "utf-8",
      );
    }
  }

  private writeDatabaseCollection(collectionName: string) {
    const collectionPath: string = join(databasePath, collectionName);
    writeFileSync(
      collectionPath,
      JSON.stringify(this.store[collectionName]),
      "utf-8",
    );
  }

  insertOne(collectionName: string, document: Object) {
    if (!this.store[collectionName]) this.store[collectionName] = [];
    this.store[collectionName]?.push(document);
    this.writeDatabaseCollection(collectionName);
  }

  findOne(collectionName: string, search: Object) {
    if (!this.store[collectionName]) this.store[collectionName] = [];
    return findBy(this.store[collectionName], search);
  }

  getCollection(collectionName: string): Undefined<Object> {
    return this.store[collectionName];
  }
}

function findBy<T extends object>(
  items: T[],
  search: Partial<T>,
): Undefined<T> {
  return items.find((obj) =>
    Object.entries(search).every(
      ([key, value]) => obj[key as keyof T] === value,
    ),
  );
}
