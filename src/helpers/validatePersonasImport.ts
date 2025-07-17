import Joi from "joi";

export type PersonasImport = {
  default_persona: string,
  persona_descriptions: Record<string, { description: string, position: number }>
  personas: Record<string, string>
}

const schema = Joi.object({
  default_persona: Joi.string(),
  persona_descriptions: Joi.object({}).pattern(Joi.string(), Joi.object({
    description: Joi.string().allow(""),
    position: Joi.number().integer(),
  })),
  persona: Joi.object({}).pattern(Joi.string(), Joi.string()),
});

export const validatePersonasImport = (data: Record<string, unknown>): data is PersonasImport => {
  const result = schema.validate(data, { abortEarly: false, allowUnknown: true });
  if (result.error) throw result.error;
  return true;
};