import type { Token, Undefined, User } from "@types";

import { sign, verify } from "crypto";

const SIGNATURE_ALGORITHM: null = null;
const SIGNATURE_ENCODING: "hex" = "hex";
const KEY_PAIR_ENCODING: BufferEncoding = "base64";
const KEY_PAIR_DECODING: BufferEncoding = "utf-8";

function decodeKey(key: string) {
  return Buffer.from(key, KEY_PAIR_ENCODING).toString(KEY_PAIR_DECODING);
}

export class Session {
  private static instance: Undefined<Session>;

  private constructor() {}

  private signData(data: string, privateKey: string) {
    const signedBuffer: Buffer = sign(
      SIGNATURE_ALGORITHM,
      data,
      decodeKey(privateKey),
    );

    return signedBuffer.toString(SIGNATURE_ENCODING);
  }

  public static init(): Session {
    if (!Session.instance) Session.instance = new Session();
    return Session.instance;
  }

  public createSession(user: User): Token {
    const timestamp: number = new Date().getTime();
    const signatureData: string = `${timestamp}:${user.email}`;

    const token: Token = {
      timestamp,
      email: user.email,
      signature: this.signData(signatureData, user.session.privateKey),
    };

    return token;
  }

  public verifySession(user: User, token: Token) {
    const signatureData: string = `${token.timestamp}:${token.email}`;

    return verify(
      SIGNATURE_ALGORITHM,
      signatureData,
      decodeKey(user.session.publicKey),
      Buffer.from(token.signature, SIGNATURE_ENCODING),
    );
  }
}
