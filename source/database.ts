import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import type { Undefined } from "@types";

import { basePath } from "#helpers";

const DATABASE_PATH: string = "/database";
const ENCODING: "utf-8" = "utf-8";

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
        readFileSync(collectionPath, ENCODING),
      );
    }
  }

  private writeDatabase() {
    for (const collectionName of Object.keys(this.store)) {
      const collectionPath: string = join(databasePath, collectionName);
      writeFileSync(
        collectionPath,
        JSON.stringify(this.store[collectionName]),
        ENCODING,
      );
    }
  }

  private writeDatabaseCollection(collectionName: string) {
    const collectionPath: string = join(databasePath, collectionName);
    writeFileSync(
      collectionPath,
      JSON.stringify(this.store[collectionName]),
      ENCODING,
    );
  }

  insertOne<T extends Object>(collectionName: string, document: T) {
    if (!this.store[collectionName]) this.store[collectionName] = [];
    this.store[collectionName]?.push(document);
    this.writeDatabaseCollection(collectionName);
  }

  deleteOne<T extends Object>(collectionName: string, document: T) {
    if (!this.store[collectionName]) this.store[collectionName] = [];
    const index: number = findIndexBy(this.store[collectionName], document);
    if (index > -1) this.store[collectionName].splice(index, 1);
    this.writeDatabaseCollection(collectionName);
  }

  findOne<T>(collectionName: string, search: Object): Undefined<T> {
    if (!this.store[collectionName]) this.store[collectionName] = [];
    return findBy(this.store[collectionName], search) as Undefined<T>;
  }

  find<T>(collectionName: string, search: Object): T[] {
    if (!this.store[collectionName]) this.store[collectionName] = [];
    return filterBy(this.store[collectionName], search) as T[];
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

function filterBy<T extends object>(items: T[], search: Partial<T>): T[] {
  return items.filter((obj) =>
    Object.entries(search).every(
      ([key, value]) => obj[key as keyof T] === value,
    ),
  );
}

function findIndexBy<T extends object>(items: T[], search: Partial<T>): number {
  return items.findIndex((obj) =>
    Object.entries(search).every(
      ([key, value]) => obj[key as keyof T] === value,
    ),
  );
}

export const database = new Database();
