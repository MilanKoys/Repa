import type { Undefined, ValidatorRules } from "@types";

export class Validator {
  schema: Undefined<{ [key: string]: Validator }>;
  type: Undefined<string>;
  rules: ValidatorRules = {
    required: false,
  };
  mandatory: boolean = false;

  private validateKeys(data: any) {
    const schema = this.schema;
    if (!schema) return false;
    return Object.keys(schema).every((key) => Object.keys(data).includes(key));
  }

  required() {
    this.rules.required = true;
    return this;
  }

  string() {
    this.type = "string";
    return this;
  }

  object(data: { [key: string]: Validator }) {
    this.schema = data;
    this.type = "object";
    return this;
  }

  validate(data: any) {
    if (typeof data !== this.type) return false;

    if (this.type === "object" && this.schema) {
      if (!this.validateKeys(data)) {
        return false;
      }
    }

    return true;
  }
}
