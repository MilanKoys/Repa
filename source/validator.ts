import { Shape, TypeOf } from "#enums";
import type { ValidationRules, Undefined, ObjectKey } from "@types";
import type { webcrypto } from "crypto";

type Schema = ObjectKey<Validator>;

export class Validator {
  schema: Undefined<Schema>;
  shape: Undefined<Shape>;
  typeOf: Undefined<TypeOf>;

  rules: ValidationRules = {
    required: false,
    strict: true,
  };

  private getValidator(): Validator {
    if (this.shape) return new Validator();
    return this;
  }

  private bindValidator(shape: Shape, typeOf: TypeOf): Validator {
    const validator: Validator = this.getValidator();
    validator.shape = shape;
    validator.typeOf = typeOf;

    return validator;
  }

  private validateRequired(data: unknown) {
    if (this.rules.required) {
      if (data === undefined || data === null) return false;
    }

    return true;
  }

  private validateStrict(schema: Schema, data: any) {
    if (this.rules.strict) {
      const dataKeys: string[] = Object.keys(data);
      if (!dataKeys.every((key) => Object.keys(schema).includes(key))) {
        return false;
      }
    }

    return true;
  }

  private validateKey(schema: Schema, data: ObjectKey<unknown>, key: string) {
    const schemaValidator: Undefined<Validator> = schema[key];
    const dataShape: Undefined<unknown> = data[key];

    if (!schemaValidator) return false;
    if (!schemaValidator.rules.required) return true;
    if (!schemaValidator.validate(dataShape)) return false;

    return Object.keys(data).includes(key);
  }

  private validateObject(data: ObjectKey<unknown>) {
    const schema = this.schema;
    if (!schema) return false;

    if (!this.validateStrict(schema, data)) return false;

    return Object.keys(schema).every((key) =>
      this.validateKey(schema, data, key),
    );
  }

  private validateString(data: string) {
    if (this.rules.min) {
      if (data.length < this.rules.min) return false;
    }

    if (this.rules.max) {
      if (data.length > this.rules.max) return false;
    }

    return true;
  }

  private validateNumber(data: number) {
    if (this.rules.min) {
      if (data < this.rules.min) return false;
    }

    if (this.rules.max) {
      if (data > this.rules.max) return false;
    }

    return true;
  }

  private validateBoolean(data: boolean) {
    return true;
  }

  private validateCategory(data: any) {
    if (!this.validateRequired(data)) return false;

    switch (this.shape) {
      case Shape.Object:
        return this.validateObject(data);
      case Shape.String:
        return this.validateString(data);
      case Shape.Number:
        return this.validateNumber(data);
      case Shape.Boolean:
        return this.validateBoolean(data);
      default:
        return true;
    }
  }

  public validate(data: unknown) {
    if (typeof data !== this.typeOf) return false;
    if (!this.validateCategory(data)) return false;

    return true;
  }

  public object(schema: Schema) {
    const validator: Validator = this.bindValidator(
      Shape.Object,
      TypeOf.Object,
    );
    validator.schema = schema;

    return validator;
  }

  public string() {
    return this.bindValidator(Shape.String, TypeOf.String);
  }

  public boolean() {
    return this.bindValidator(Shape.Boolean, TypeOf.Boolean);
  }

  public number() {
    return this.bindValidator(Shape.Number, TypeOf.Number);
  }

  public required() {
    this.rules.required = true;
    return this;
  }

  public loose() {
    this.rules.strict = false;
    return this;
  }

  public min(size: number) {
    this.rules.min = size;
    return this;
  }

  public max(size: number) {
    this.rules.max = size;
    return this;
  }
}
