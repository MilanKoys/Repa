import type { Token, Undefined, User } from "@types";

import { sign, verify } from "crypto";

const SIGNATURE_ALGORITHM: null = null;
const SIGNATURE_ENCODING: "hex" = "hex";

export class Session {
  private static instance: Undefined<Session>;

  private constructor() {}

  private signData(data: string, privateKey: string) {
    const signedBuffer: Buffer = sign(SIGNATURE_ALGORITHM, data, privateKey);

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
      user.session.publicKey,
      Buffer.from(token.signature, SIGNATURE_ENCODING),
    );
  }
}
