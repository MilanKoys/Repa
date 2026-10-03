import type { KeyPairExportResult } from "crypto";

export interface UserBase {
  email: string;
  password: string;
}

export type UserRegister = UserBase & {
  firstName: string;
  surName: string;
};

export type UserSessionKeys = KeyPairExportResult<{
  privateKeyEncoding: {
    type: "pkcs8";
    format: "pem";
  };
  publicKeyEncoding: {
    type: "spki";
    format: "pem";
  };
}>;

export type User = UserBase & {
  firstName: string;
  surName: string;
  created: number;
  session: UserSessionKeys;
};
