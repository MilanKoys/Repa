import type {
  DynamicServeOptions,
  Route,
  ServerRequest,
  ServerResponse,
  VoidMethod,
} from "@types";

import { join, extname } from "path";
import { readFile } from "fs";

const BACK_TWO_DIR: string = "../../";
const FALLBACK_URL: string = "/";
const FILE_ENCODING: BufferEncoding = "utf-8";
const ROOT_FILE_PATH: string = join(import.meta.dirname, BACK_TWO_DIR);

const CONTENT_TYPE_HEADER: string = "Content-Type";
const FALL_BACK_MIME_TYPE: string = "text";
const MIME_TYPE_MAP: Record<string, string> = {
  ".html": "text/html",
  ".json": "application/json",
  ".css": "text/css",
  ".js": "text/javascript",
};

export function dynamicServe(
  path: string,
  options?: DynamicServeOptions,
): Route {
  const mainPath: string = join(ROOT_FILE_PATH, path);

  return (
    request: ServerRequest,
    response: ServerResponse,
    next: VoidMethod,
  ) => {
    let url: string = request.incomingMessage.url ?? FALLBACK_URL;

    if (options && options.rootFilePath && url === FALLBACK_URL) {
      url += options.rootFilePath;
    } else if (options && options.appendExtension) {
      url += options.appendExtension;
    }

    const requestedPath: string = join(mainPath, url);
    readFile(requestedPath, { encoding: FILE_ENCODING }, (error, file) => {
      if (error) return next();

      const extension: string = extname(requestedPath);
      const mimeType: string = MIME_TYPE_MAP[extension] ?? FALL_BACK_MIME_TYPE;

      response.outgoingMessage.setHeader(CONTENT_TYPE_HEADER, mimeType);
      response.outgoingMessage.write(file);
      response.outgoingMessage.end();
    });
  };
}
