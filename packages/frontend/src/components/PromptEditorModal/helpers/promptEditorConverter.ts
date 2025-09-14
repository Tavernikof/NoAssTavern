import { Prompt } from "src/store/Prompt.ts";
import { PresetFieldType } from "src/enums/PresetFieldType.ts";
import { BackendProviderItem } from "src/enums/BackendProvider.ts";

const promptToModelParsers: Record<PresetFieldType, (v: unknown) => any> = {
  "input": (v) => typeof v === "string" ? v : "",
  "checkbox": (v) => typeof v === "boolean" ? v : !!v,
  "textarea": (v) => typeof v === "string" ? v : "",
  "stringArray": (v) => Array.isArray(v) ? v.join(",") : "",
  "number": (v) => typeof v === "number" ? String(v) : "",
};

const modelToPromptParsers: Record<PresetFieldType, (v: unknown) => any> = {
  "input": (v) => v,
  "checkbox": (v) => !!v,
  "textarea": (v) => v,
  "stringArray": (v) => v.split(",").map(v => v.trim()).filter(Boolean),
  "number": (v) => +v || 0,
};

export const promptToModel = (backendProvider: BackendProviderItem, prompt: Prompt) => {
  const model: Record<string, any> = {};

  backendProvider.class.config.forEach(field => {
    const value = prompt.generationConfig[field.name];
    model[field.name] = promptToModelParsers[field.type](value);
  });

  return model;
};

export const modelToPrompt = (backendProvider: BackendProviderItem, prompt: Prompt, model: Record<string, any>) => {
  const data: Record<string, any> = {};

  backendProvider.class.config.forEach(field => {
    const value = model[field.name];
    data[field.name] = modelToPromptParsers[field.type](value);
  });

  return data;

};