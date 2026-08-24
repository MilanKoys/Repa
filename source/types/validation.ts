export interface ValidatorMandatoryRules {
  required: boolean;
}

export type ValidatorOptionalRules = Partial<{
  min: number;
  max: number;
}>;

export type ValidatorRules = ValidatorMandatoryRules & ValidatorOptionalRules;
