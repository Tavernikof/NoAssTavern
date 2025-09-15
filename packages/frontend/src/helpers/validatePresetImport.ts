import Joi from "joi";

export type PresetImport = {
  chat_completion_source: string;
  openai_model: string;
  claude_model: string;
  windowai_model: string;
  openrouter_model: string;
  openrouter_use_fallback: boolean;
  openrouter_group_models: boolean;
  openrouter_sort_models: string;
  openrouter_providers: string[];
  openrouter_allow_fallbacks: boolean;
  ai21_model: string;
  mistralai_model: string;
  cohere_model: string;
  perplexity_model: string;
  groq_model: string;
  zerooneai_model: string;
  blockentropy_model: string;
  custom_model: string;
  custom_prompt_post_processing: string;
  google_model: string;
  temperature: number;
  frequency_penalty: number;
  presence_penalty: number;
  top_p: number;
  top_k: number;
  top_a: number;
  min_p: number;
  repetition_penalty: number;
  openai_max_context: number;
  openai_max_tokens: number;
  wrap_in_quotes: boolean;
  names_behavior: number;
  send_if_empty: string;
  jailbreak_system: boolean;
  impersonation_prompt: string;
  new_chat_prompt: string;
  new_group_chat_prompt: string;
  new_example_chat_prompt: string;
  continue_nudge_prompt: string;
  bias_preset_selected: string;
  max_context_unlocked: boolean;
  wi_format: string;
  scenario_format: string;
  personality_format: string;
  group_nudge_prompt: string;
  stream_openai: boolean;
  prompts: {
    name: string;
    system_prompt: boolean;
    role?: "assistant" | "system" | "user";
    content?: string;
    identifier: string;
    injection_position?: number;
    injection_depth?: number;
    forbid_overrides?: boolean;
    marker?: boolean;
    enabled?: boolean;
  }[];
  prompt_order: {
    character_id: number | string;
    order: {
      identifier: string;
      enabled: boolean;
    }[];
  }[];
  api_url_scale: string;
  show_external_models: boolean;
  assistant_prefill: string;
  assistant_impersonation: string;
  human_sysprompt_message: string;
  claude_use_sysprompt: boolean;
  use_makersuite_sysprompt: boolean;
  use_alt_scale: boolean;
  squash_system_messages: boolean;
  image_inlining: boolean;
  inline_image_quality: string;
  bypass_status_check: boolean;
  continue_prefill: boolean;
  continue_postfix: string;
  function_calling: boolean;
  seed: number;
  n: number;
}

const schema = Joi.object({
  temperature: Joi.number(),
  frequency_penalty: Joi.number(),
  presence_penalty: Joi.number(),
  top_p: Joi.number(),
  top_k: Joi.number(),
  top_a: Joi.number(),
  min_p: Joi.number(),
  repetition_penalty: Joi.number(),
  prompts: Joi.array().items(Joi.object({
    name: Joi.string().allow(""),
    system_prompt: Joi.boolean(),
    role: Joi.string().optional(),
    content: Joi.string().allow("").optional(),
    identifier: Joi.string(),
    injection_position: Joi.number().optional(),
    injection_depth: Joi.number().optional(),
    forbid_overrides: Joi.boolean().optional(),
    marker: Joi.boolean().optional(),
    enabled: Joi.boolean().optional(),
  })),
  prompt_order: Joi.array().items(Joi.object({
    character_id: Joi.alternatives().try(Joi.number(), Joi.string()),
    order: Joi.array().items(Joi.object({
      identifier: Joi.string(),
      enabled: Joi.boolean(),
    })),
  })),
});

export const validatePresetImport = (json: Record<string, unknown>): json is PresetImport => {
  const result = schema.validate(json, { abortEarly: false, allowUnknown: true });
  if (result.error) throw result.error;
  return true;
};