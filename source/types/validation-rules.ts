export interface RulesMandatory {
  required: boolean;
  strict: boolean;
}

export type RulesOptional = Partial<{
  min: number;
  max: number;
}>;

export type ValidationRules = RulesMandatory & RulesOptional;
