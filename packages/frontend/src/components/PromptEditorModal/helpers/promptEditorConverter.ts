import { Prompt } from "src/store/Prompt.ts";
import { PresetFieldType } from "src/enums/PresetFieldType.ts";
import { BackendProviderItem } from "src/enums/BackendProvider.ts";
import { isObject } from "lodash";

const promptToModelParsers: Record<PresetFieldType, (v: unknown) => any> = {
  "input": (v) => typeof v === "string" ? v : "",
  "checkbox": (v) => typeof v === "boolean" ? v : !!v,
  "textarea": (v) => typeof v === "string" ? v : "",
  "stringArray": (v) => Array.isArray(v) ? v.join(",") : "",
  "number": (v) => typeof v === "number" ? String(v) : "",
  "select": (v) => typeof v === "string" ? { value: v, label: v } : null,
};

const modelToPromptParsers: Record<PresetFieldType, (v: unknown) => any> = {
  "input": (v) => v,
  "checkbox": (v) => Boolean(v),
  "textarea": (v) => v,
  "stringArray": (v) => typeof v === "string" ? v.split(",").map(v => v.trim()).filter(Boolean) : [],
  "number": (v) => {
    if (typeof v === "string" && v && !Number.isNaN(+v)) return +v;
    return undefined;
  },
  "select": (v) => (isObject(v) && v !== null && "value" in v) ? v.value : null,
};

export const promptToModel = (backendProvider: BackendProviderItem, prompt: Prompt) => {
  const model: Record<string, any> = {};

  backendProvider.class.config.forEach(field => {
    const value = prompt.generationConfig[field.name];
    model[field.name] = promptToModelParsers[field.type](value);
  });

  return model;
};

export const modelToPrompt = (backendProvider: BackendProviderItem, model: Record<string, any>) => {
  const data: Record<string, any> = {};

  backendProvider.class.config.forEach(field => {
    const value = model[field.name];
    data[field.name] = modelToPromptParsers[field.type](value);
  });

  return data;

};