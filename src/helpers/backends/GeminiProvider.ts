import { BaseBackendProvider } from "src/helpers/backends/BaseBackendProvider.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import parseJSON from "src/helpers/parseJSON.ts";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import axios, { AxiosError, AxiosResponse } from "axios";
import { stripLastSlash } from "src/helpers/stripLastSlash.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import { PresetFieldType } from "src/enums/PresetFieldType.ts";

const STREAM = "streamGenerateContent";
const NON_STREAM = "generateContent";
const GEMINI_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
  { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" },
];

// ============================================================================

type GeminiFinishReason =
  | "FINISH_REASON_UNSPECIFIED"
  | "STOP"
  | "MAX_TOKENS"
  | "SAFETY"
  | "RECITATION"
  | "LANGUAGE"
  | "OTHER"
  | "BLOCKLIST"
  | "PROHIBITED_CONTENT"
  | "SPII"
  | "MALFORMED_FUNCTION_CALL"
  ;

type GeminiBlockReason =
  | "BLOCK_REASON_UNSPECIFIED"
  | "SAFETY"
  | "OTHER"
  | "BLOCKLIST"
  | "PROHIBITED_CONTENT"
  | "IMAGE_SAFETY"
  ;

type GeminiModelResponse = {
  "name": `models/${string}`,
  "version": string,
  "displayName": string,
  "description": string,
  "inputTokenLimit": number,
  "outputTokenLimit": number,
  "supportedGenerationMethods": string[]
  "temperature": number,
  "topP": number,
  "topK": number
}

type GeminiModelsResponse = {
  models: GeminiModelResponse[]
}

type GeminiRawResponse = {
  "candidates": {
    "content": {
      "parts": { "text": string }[],
      "role": "model"
    },
    finishReason?: GeminiFinishReason
    index: 0
    "safetyRatings": { "category": string, "probability": string }[]
  }[],
  promptFeedback?: { blockReason?: GeminiBlockReason }
  "usageMetadata": {
    "promptTokenCount": number,
    "candidatesTokenCount": number,
    "totalTokenCount": number
  },
  "modelVersion": string
}

type GeminiConfig = {
  stream: boolean;
  temperature: number;
  stopSequences: string[];
  clientOnlyStop: boolean;
  maxOutputTokens: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
  system: number;
}

// ============================================================================

class GeminiProvider extends BaseBackendProvider {
  baseUrl = "https://generativelanguage.googleapis.com";
  documentationLink = "https://ai.google.dev/api/generate-content#method:-models.generatecontent";

  config: PresetFieldConfig[] = [
    { name: "stream", label: "Stream", type: PresetFieldType.checkbox },
    { name: "temperature", label: "temperature", type: PresetFieldType.number },
    { name: "stopSequences", label: "stopSequences", type: PresetFieldType.stringArray },
    { name: "clientOnlyStop", label: "Client-only stop string", type: PresetFieldType.checkbox },
    { name: "maxOutputTokens", label: "maxOutputTokens", type: PresetFieldType.number },
    { name: "topP", label: "topP", type: PresetFieldType.number },
    { name: "topK", label: "topK", type: PresetFieldType.number },
    { name: "presencePenalty", label: "presencePenalty", type: PresetFieldType.number },
    { name: "frequencyPenalty", label: "frequencyPenalty", type: PresetFieldType.number },
    { name: "system", label: "System instruction", type: PresetFieldType.textarea },
  ];

  async generate(config: BackendProviderGenerateConfig<GeminiConfig>): Promise<BackendProviderGenerateResponse> {
    const {
      messageController,
      model,
      baseUrl = this.baseUrl,
      key = globalSettings.geminiKey,
      messages,
      onUpdate,
      abortController,

      generationConfig: {
        stream,
        temperature,
        stopSequences,
        clientOnlyStop,
        maxOutputTokens,
        topP,
        topK,
        presencePenalty,
        frequencyPenalty,
        system,
      },
    } = config;

    const safetySettings = model.includes("gemini-2.0-flash-exp")
      ? GEMINI_SAFETY_SETTINGS.map(setting => ({ ...setting, threshold: "OFF" }))
      : GEMINI_SAFETY_SETTINGS;

    const stop = this.prepareStop(stopSequences, messageController);

    const requestBody = {
      contents: messages.map(block => ({
        role: block.role === ChatMessageRole.ASSISTANT ? "model" : "user",
        parts: [{ text: block.content }],
      })),
      systemInstruction: system ? { parts: { text: system } } : undefined,
      generationConfig: {
        stopSequences: stream && clientOnlyStop ? undefined : stop,
        candidateCount: 1,
        maxOutputTokens: maxOutputTokens,
        temperature,
        topP,
        topK,
        presencePenalty,
        frequencyPenalty,
      },
      safetySettings,
    };

    let response: AxiosResponse;
    const isDefaultEndpoint = baseUrl === this.baseUrl;
    const url = `${stripLastSlash(baseUrl)}/v1beta/models/${model}:${stream ? STREAM : NON_STREAM}`;
    try {
      response = await axios.post(url, requestBody, {
        signal: abortController?.signal,
        headers: {
          "X-goog-api-key": isDefaultEndpoint ? key : undefined,
          "Authorization": isDefaultEndpoint ? undefined : `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
        adapter: "fetch",
      });
    } catch (response) {
      return {
        message: "",
        error: await this.getAxiosError(response as AxiosError),
        url,
        request: requestBody,
        inputTokens: 0,
        outputTokens: 0,
      };
    }

    const {
      message = "",
      error = undefined,
      inputTokens = 0,
      outputTokens = 0,
    } = await this.createResponseParser({
      response,
      stop: clientOnlyStop ? stop : undefined,
      onUpdate,

      parseStreamEvent: (event) => {
        const dataPrefix = "data: ";
        if (!event.startsWith(dataPrefix)) return;

        let chunk = "";
        let error: string | undefined;
        event = event.slice(dataPrefix.length);
        const data = parseJSON(event) as GeminiRawResponse;
        if (!data) return;
        if (data.promptFeedback?.blockReason) {
          error = "blockReason: " + data.promptFeedback?.blockReason;
        } else if (data.candidates) {
          const candidate = data.candidates[0];
          if (candidate.finishReason && candidate.finishReason !== "STOP") {
            error = "finishReason: " + candidate.finishReason;
          }
          if (candidate.content?.parts) {
            chunk = candidate.content.parts.map(part => part.text).join("");
          }
        }

        return {
          chunk,
          error,
          inputTokens: data.usageMetadata?.promptTokenCount,
          outputTokens: data.usageMetadata?.candidatesTokenCount,
        };
      },

      parseJson: (data) => {
        const key = data.key;
        if (key === "promptFeedback") {
          const value = data.value as GeminiRawResponse['promptFeedback'];
          return { error: "finishReason: " + value?.blockReason || 'unknown reason' };
        }
        if (key === "candidates") {
          const value = data.value as GeminiRawResponse["candidates"];
          const candidate = value[0] as GeminiRawResponse["candidates"][number];
          if (candidate.finishReason && candidate.finishReason !== "STOP") {
            return { error: "finishReason: " + candidate.finishReason };
          }
          if (candidate.content) {
            return { chunk: candidate.content.parts.map(part => part.text).join("") };
          }
        }

        if (key === "usageMetadata") {
          const value = data.value as GeminiRawResponse["usageMetadata"];
          return {
            inputTokens: value.promptTokenCount,
            outputTokens: value.candidatesTokenCount,
          };
        }
      },
    });

    return {
      message: message.trim(),
      error,
      url,
      request: requestBody,
      inputTokens,
      outputTokens,
    };
  };

  // ============================================================================

  getModelsOptions(connectionProxy?: ConnectionProxy): Promise<BackendProviderGetModelsResponse> {
    const baseUrl = connectionProxy?.baseUrl || this.baseUrl;
    const key = connectionProxy?.key || globalSettings.geminiKey;
    const modelsEndpoint = connectionProxy?.modelsEndpoint || `/v1beta/models/`;

    const isDefaultEndpoint = baseUrl === this.baseUrl;
    return axios.get<GeminiModelsResponse>(
      `${stripLastSlash(baseUrl)}/${stripLastSlash(modelsEndpoint)}`,
      {
        headers: {
          "X-goog-api-key": isDefaultEndpoint ? key : undefined,
          "Authorization": isDefaultEndpoint ? undefined : `Bearer ${key}`,
        },
      },
    ).then(
      (response) => this.extractModels(response.data),
      this.extractAxiosError,
    );
  }

  // ============================================================================

  getRequestMessages(request: Record<string, any>): PresetPrompt {
    return (request.contents as { role: string, parts: { text: string }[] }[]).map(content => ({
      role: content.role as ChatMessageRole,
      content: content.parts[0].text,
    }));
  }
}

export const geminiProvider = new GeminiProvider();