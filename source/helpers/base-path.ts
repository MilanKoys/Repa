import { join } from "path";

const BASE_PATH_HELPER: string = "../../../";

export const basePath = (): string => {
  return join(import.meta.url, BASE_PATH_HELPER).split(":")[1] as string;
};
