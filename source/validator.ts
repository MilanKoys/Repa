import type { Undefined, ValidatorRules } from "@types";

export class Validator {
  schema: Undefined<{ [key: string]: Validator }>;
  type: Undefined<string>;
  valueType: Undefined<string>;
  rules: ValidatorRules = {
    required: false,
    strict: true,
  };
  mandatory: boolean = false;

  private getValidator(): Validator {
    if (this.type) return new Validator();
    return this;
  }

  private validateKeys(data: any) {
    const schema = this.schema;
    if (!schema) return false;

    if (this.rules.strict) {
      const dataKeys: string[] = Object.keys(data);
      if (!dataKeys.every((key) => Object.keys(schema).includes(key))) {
        return false;
      }
    }

    return Object.keys(schema).every((key) => {
      const schemaValidator: Undefined<Validator> = schema[key];
      const schemaValue: Undefined<any> = data[key];

      if (!schemaValidator) return false;
      if (!schemaValidator.rules.required) return true;
      if (!schemaValidator.validate(schemaValue)) return false;

      return Object.keys(data).includes(key);
    });
  }

  private validateString(data: any) {
    if (this.rules.min) {
      if (data.length < this.rules.min) return false;
    }

    if (this.rules.max) {
      if (data.length > this.rules.max) return false;
    }

    if (this.rules.email) {
      if (!data.includes("@")) return false;
    }

    return true;
  }

  private validateType(data: any) {
    if (this.rules.required) {
      if (typeof data === "undefined" || data === null) return false;
    }

    switch (this.type) {
      case "string":
        if (!this.validateString(data)) return false;
        break;
      default:
        return true;
    }

    return true;
  }

  string() {
    const validator = this.getValidator();
    validator.type = "string";
    validator.valueType = "string";

    return validator;
  }

  object(data: { [key: string]: Validator }) {
    const validator = this.getValidator();
    validator.schema = data;
    validator.type = "object";
    validator.valueType = "object";

    return validator;
  }

  required() {
    this.rules.required = true;
    return this;
  }

  loose() {
    this.rules.strict = false;
    return this;
  }

  min(length: number) {
    this.rules.min = length;
    return this;
  }

  max(length: number) {
    this.rules.max = length;
    return this;
  }

  email() {
    this.rules.email = true;
    return this;
  }

  validate(data: any) {
    if (typeof data !== this.valueType) return false;
    if (!this.validateType(data)) return false;

    if (this.type === "object" && this.schema) {
      if (!this.validateKeys(data)) {
        return false;
      }
    }

    return true;
  }
}
