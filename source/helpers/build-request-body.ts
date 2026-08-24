import type { IncomingMessage } from "http";

export async function buildRequestBody(
  request: IncomingMessage,
): Promise<string> {
  return new Promise((resolve) => {
    let bodyPartial: any = [];
    let body: string = "";

    request
      .on("data", (chunk) => bodyPartial.push(chunk))
      .on("end", () => {
        body = Buffer.concat(bodyPartial).toString();
        resolve(body);
      });
  });
}
