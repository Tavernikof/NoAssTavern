import { BaseBackendProvider } from "src/helpers/backends/BaseBackendProvider.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import parseJSON from "src/helpers/parseJSON.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import axios, { AxiosError, AxiosResponse } from "axios";
import { stripLastSlash } from "src/helpers/stripLastSlash.ts";
import { PresetFieldType } from "src/enums/PresetFieldType.ts";

// ============================================================================

//https://platform.openai.com/docs/api-reference/chat/create
type OpenaiRequest = {
  messages: { role: "developer" | "system" | "user" | "assistant", content: string | string[], name?: string }[];
  model: string;
  audio?: { format: string, voice: string };
  frequency_penalty?: number; // -2.0 ... 2.0
  logit_bias?: Record<string, number>;
  logprobs?: number;
  max_completion_tokens?: number;
  metadata?: Record<string, string>;
  modalities?: string[];
  n?: number;
  parallel_tool_calls?: boolean;
  prediction?: unknown;
  presence_penalty?: number; // -2.0 ... 2.0
  reasoning_effort?: "low" | "medium" | "high";
  response_format?:
    | { type: "text" }
    | {
    type: "json_schema",
    json_schema: { name: string, description?: string; strict?: boolean; schema?: Record<string, unknown> }
  }
    | { type: "json_object" };
  seed?: number;
  service_tier?: "auto" | "default" | "flex" | "priority";
  stop?: string | string[];
  store?: boolean;
  stream?: boolean;
  stream_options?: { include_usage?: boolean };
  temperature?: number; // 0 ... 2.0
  tool_choice?: unknown;
  tools?: unknown;
  top_logprobs?: number; // 0 ... 20
  top_p?: number;
  user?: string;
  web_search_options?: {
    search_context_size?: "low" | "medium" | "high",
    user_location?: {
      type: "approximate",
      approximate: { city: string, country: string, regior: string, timezone: string }
    }
  }
}

// https://platform.openai.com/docs/api-reference/chat/object
type OpenaiResponse = {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      refusal: string | null;
      annotations: []
    },
    logprobs: null;
    finish_reason: "stop" | "length" | "content_filter" | "tool_calls";
  }[],
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details: {
      cached_tokens: number;
      audio_tokens: number;
    },
    completion_tokens_details: {
      reasoning_tokens: number;
      audio_tokens: number;
      accepted_prediction_tokens: number;
      rejected_prediction_tokens: number;
    }
  },
  service_tier: "auto" | "default" | "flex" | "priority";
}

type OpenaiStreamResponse = {
  "id": string,
  "object": "chat.completion.chunk",
  "created": number,
  "model": string,
  service_tier: "auto" | "default" | "flex" | "priority";
  "system_fingerprint": null,
  "choices":
    {
      "index": number,
      "delta": { content?: string },
      finish_reason: "stop" | "length" | "content_filter" | "tool_calls" | null;
    }[]
}

type OpenaiConfig = {
  stream: boolean;
  temperature: number;
  stopSequences: string[];
  clientOnlyStop: boolean;
  maxOutputTokens: number;
  topP: number;
  presencePenalty: number;
}

// ============================================================================

class OpenaiProvider extends BaseBackendProvider {
  baseUrl = "https://api.openai.com/v1";

  documentationLink = "https://platform.openai.com/docs/api-reference/chat";

  config: PresetFieldConfig[] = [
    { name: "stream", label: "Stream", type: PresetFieldType.checkbox },
    { name: "temperature", label: "temperature", type: PresetFieldType.number },
    { name: "stopSequences", label: "stopSequences", type: PresetFieldType.stringArray },
    { name: "clientOnlyStop", label: "Client-only stop string", type: PresetFieldType.checkbox },
    { name: "maxOutputTokens", label: "Мax completion tokens", type: PresetFieldType.number },
    { name: "topP", label: "topP", type: PresetFieldType.number },
    { name: "presencePenalty", label: "presencePenalty", type: PresetFieldType.number },
  ];

  async generate(config: BackendProviderGenerateConfig<OpenaiConfig>): Promise<BackendProviderGenerateResponse> {
    const {
      messageController,
      model,
      baseUrl = this.baseUrl,
      key = globalSettings.openaiKey,
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
        presencePenalty,
      },

    } = config;

    const stop = this.prepareStop(stopSequences, messageController);

    const requestBody: OpenaiRequest = {
      max_completion_tokens: maxOutputTokens,
      messages: messages,
      model: model,
      stop: stream && clientOnlyStop ? undefined : stop,
      stream: stream,
      stream_options: stream ? { "include_usage": true } : undefined,
      temperature: temperature,
      top_p: topP,
      presence_penalty: presencePenalty,
    };
    const url = `${stripLastSlash(baseUrl)}/chat/completions`;

    let response: AxiosResponse;
    try {
      response = await axios.post(url, requestBody, {
        signal: abortController.signal,
        headers: {
          "Authorization": `Bearer ${key}`,
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
        if (event.trim() === "[DONE]") return "DONE";

        const data = parseJSON(event) as OpenaiStreamResponse;
        if (!data || !data.choices) return;
        data.choices.map(choice => {
          if (choice.finish_reason && choice.finish_reason !== "stop") {
            error = "finishReason: " + choice.finish_reason;
          }
          if (choice.delta?.content) {
            chunk += choice.delta.content;
          }
        });

        return {
          chunk,
          error,
        };

      },

      parseJson: (data) => {
        const key = data.key;
        if (key === "choices") {
          const value = data.value as OpenaiResponse["choices"];
          const choice = value[0];
          if (choice.finish_reason !== "stop") return { error: "finishReason: " + choice.finish_reason };
          if (choice.message.refusal) return { error: "refusal: " + choice.message.refusal };
          if (choice.message.content) return { message: choice.message.content };
          return;
        }

        if (key === "usage") {
          const usage = data.value as OpenaiResponse["usage"];
          return {
            inputTokens: usage.prompt_tokens,
            outputTokens: usage.completion_tokens,
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
  }

  // ============================================================================

  getModelsOptions(connectionProxy?: ConnectionProxy): Promise<BackendProviderGetModelsResponse> {
    const baseUrl = connectionProxy?.baseUrl || this.baseUrl;
    const key = connectionProxy?.key || globalSettings.claudeKey;
    const modelsEndpoint = connectionProxy?.modelsEndpoint || `models`;

    return axios.get(`${stripLastSlash(baseUrl)}/${stripLastSlash(modelsEndpoint)}`, {
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": key,
        "authorization": `Bearer ${key}`,
      },
    }).then(
      (response) => this.extractModels(response.data),
      this.extractAxiosError,
    );
  }

  // ============================================================================

  getRequestMessages(request: Record<string, any>): PresetPrompt {
    return request.messages;
  }
}

export const openaiProvider = new OpenaiProvider();