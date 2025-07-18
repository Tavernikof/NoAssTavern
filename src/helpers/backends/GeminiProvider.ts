import { BaseBackendProvider } from "src/helpers/backends/BaseBackendProvider.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import parseJSON from "src/helpers/parseJSON.ts";
import { JSONParser } from "@streamparser/json";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import axios, { AxiosError, AxiosResponse } from "axios";
import { stripLastSlash } from "src/helpers/stripLastSlash.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";

const BASE_URL = "https://generativelanguage.googleapis.com";
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
  }[]
  "usageMetadata": {
    "promptTokenCount": number,
    "candidatesTokenCount": number,
    "totalTokenCount": number
  },
  "modelVersion": string
}

type ResponseParserMessage = {
  message: string,
  chunk: string,
  error: string | undefined,
  inputTokens: number,
  outputTokens: number
}

type ResponseParser = (onData: (data: ResponseParserMessage) => void) => (text: string) => void;

// ============================================================================

class GeminiProvider extends BaseBackendProvider {
  documentationLink = "https://ai.google.dev/api/generate-content#method:-models.generatecontent";

  async generate(config: BackendProviderGenerateConfig): Promise<BackendProviderGenerateResponse> {
    const {
      baseUrl = BASE_URL,
      key = globalSettings.geminiKey,
      model,
      stream,
      messages,
      stopSequences,
      system,
      maxTokens,
      temperature,
      topP,
      topK,
      candidateCount = 1,
      presencePenalty,
      frequencyPenalty,
      onUpdate,
      abortController,
    } = config;

    const safetySettings = model.includes("gemini-2.0-flash-exp")
      ? GEMINI_SAFETY_SETTINGS.map(setting => ({ ...setting, threshold: "OFF" }))
      : GEMINI_SAFETY_SETTINGS;

    const requestBody = {
      contents: messages.map(block => ({
        role: block.role === ChatMessageRole.ASSISTANT ? "model" : "user",
        parts: [{ text: block.content }],
      })),
      systemInstruction: system ? { parts: { text: system } } : undefined,
      generationConfig: {
        stopSequences: Array.isArray(stopSequences) && stopSequences.length ? stopSequences : undefined,
        candidateCount,
        maxOutputTokens: maxTokens,
        temperature,
        topP,
        topK,
        presencePenalty,
        frequencyPenalty,
      },
      safetySettings,
    };

    let response: AxiosResponse;
    const isDefaultEndpoint = baseUrl === BASE_URL;
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

    let lastResponse: ResponseParserMessage | null = null;

    const onData = (data: ResponseParserMessage) => {
      lastResponse = data;
      onUpdate?.({ chunk: data.chunk });
    };

    const contentType = response?.headers["content-type"];
    const isStream = contentType?.includes("text/event-stream");

    const parser = isStream
      ? this.createStreamParser(onData)
      : this.createJsonParser(onData);

    const reader = response.data
      .pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      parser(value);
    }

    const { message = "", error = undefined, inputTokens = 0, outputTokens = 0 } = lastResponse ?? {};
    return {
      message: message.trim(),
      error,
      inputTokens,
      outputTokens,
      url,
      request: requestBody,
    };
  };

  // ============================================================================

  getModelsOptions(connectionProxy?: ConnectionProxy): Promise<BackendProviderGetModelsResponse> {
    const baseUrl = connectionProxy?.baseUrl || BASE_URL;
    const key = connectionProxy?.key || globalSettings.geminiKey;
    const modelsEndpoint = connectionProxy?.modelsEndpoint || `/v1beta/models/`;

    const isDefaultEndpoint = baseUrl === BASE_URL;
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

  // ============================================================================

  private createStreamParser: ResponseParser = (onData) => {
    const dataPrefix = "data: ";
    let chunk = "";
    let message = "";
    let error: string | undefined;

    return (text: string) => {
      const events = text.split("\n\n");
      events.forEach(event => {
        if (event.startsWith(dataPrefix)) {
          event = event.slice(dataPrefix.length);
          const data = parseJSON(event) as GeminiRawResponse;
          if (!data) return;
          const candidate = data.candidates[0];
          if (candidate.finishReason && candidate.finishReason !== "STOP") {
            error = "finishReason: " + candidate.finishReason;
          }
          if (candidate.content?.parts) {
            chunk = candidate.content.parts.map(part => part.text).join("");
            message += chunk;
          }

          onData({
            message,
            chunk,
            error,
            inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
            outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          });
        }
      });
    };
  };

  private createJsonParser: ResponseParser = (onData) => {
    let error: string | undefined;
    let chunk = "";
    let message = "";
    let inputTokens = 0;
    let outputTokens = 0;

    const parser = new JSONParser();
    parser.onValue = (data) => {
      const key = data.key;
      if (key === "usageMetadata") {
        const value = data.value as GeminiRawResponse["usageMetadata"];
        inputTokens = value.promptTokenCount;
        outputTokens = value.candidatesTokenCount;
      }
      if (key === "candidates") {
        const value = data.value as GeminiRawResponse["candidates"];
        const candidate = value[0] as GeminiRawResponse["candidates"][number];
        if (candidate.finishReason && candidate.finishReason !== "STOP") {
          error = "finishReason: " + candidate.finishReason;
        }
        if (candidate.content) {
          chunk += candidate.content.parts.map(part => part.text).join("");
          message += chunk;
        }
      }
    };

    return (text: string) => {
      chunk = "";
      parser.write(text);
      onData({
        message,
        chunk,
        error,
        inputTokens,
        outputTokens,
      });
    };
  };
}

export const geminiProvider = new GeminiProvider();