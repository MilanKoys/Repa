export interface ValidatorMandatoryRules {
  required: boolean;
}

export type ValidatorOptionalRules = Partial<{
  min: number;
  max: number;
  email: boolean;
}>;

export type ValidatorRules = ValidatorMandatoryRules & ValidatorOptionalRules;
