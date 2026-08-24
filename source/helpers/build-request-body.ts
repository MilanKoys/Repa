import type { IncomingMessage } from "http";

const EMPTY_STRING = "";
const DATA_EVENT = "data";
const END_EVENT = "end";

export async function buildRequestBody(
  request: IncomingMessage,
): Promise<string> {
  return new Promise((resolve) => {
    let bodyPartial: any = [];
    let body: string = EMPTY_STRING;

    request
      .on(DATA_EVENT, (chunk) => bodyPartial.push(chunk))
      .on(END_EVENT, () => {
        body = Buffer.concat(bodyPartial).toString();
        resolve(body);
      });
  });
}
