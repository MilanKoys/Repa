import type { Role } from "#enums";
import type { KeyPairExportResult } from "crypto";

export interface UserBase {
  email: string;
  password: string;
}

export type UserRegister = UserBase & {
  firstName: string;
  surName: string;
  class: number;
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

export interface UserOptional {
  class?: number;
}

export type UserFields = UserBase & UserOptional;

export type User = UserFields & {
  firstName: string;
  surName: string;
  created: number;
  session: UserSessionKeys;
  role: Role;
};
