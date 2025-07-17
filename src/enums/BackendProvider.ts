import { geminiProvider } from "src/helpers/backends/GeminiProvider.ts";
import { claudeProvider } from "src/helpers/backends/ClaudeProvider.ts";
import createDictionary from "src/helpers/createDictionary.ts";
import { openaiProvider } from "src/helpers/backends/OpenaiProvider.ts";

export enum BackendProvider {
  GEMINI = "gemini",
  CLAUDE = "claude",
  OPENAI = "openai",
}

export const backendProviderOptions = [
  { id: BackendProvider.OPENAI, label: "Open AI", class: openaiProvider },
  { id: BackendProvider.GEMINI, label: "Gemini", class: geminiProvider },
  { id: BackendProvider.CLAUDE, label: "Claude", class: claudeProvider },
];

export const backendProviderDict = createDictionary({
  list: backendProviderOptions,
  formatLabel: (item) => item.label,
});

export type BackendProviderItem = typeof backendProviderDict.list[number];