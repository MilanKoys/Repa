export interface Config {
  port?: number;
  databaseConnectionString: string;
  databaseName: string;
}

export const config: Config = {
  port: 3000,
  databaseConnectionString: "mongodb://127.0.0.1:27017",
  databaseName: "repa",
};
