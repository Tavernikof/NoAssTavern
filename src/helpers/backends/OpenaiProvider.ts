import { BaseBackendProvider } from "src/helpers/backends/BaseBackendProvider.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import parseJSON from "src/helpers/parseJSON.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import axios, { AxiosError, AxiosResponse } from "axios";
import { stripLastSlash } from "src/helpers/stripLastSlash.ts";
import { JSONParser } from "@streamparser/json";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";

const BASE_URL = "https://api.openai.com/v1";

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

type ResponseParserMessage = {
  message: string,
  chunk: string,
  error: string | undefined,
  inputTokens: number,
  outputTokens: number
}

type ResponseParser = (onData: (data: ResponseParserMessage) => void, onDone: () => void) => (text: string) => void;

// ============================================================================

class OpenaiProvider extends BaseBackendProvider {
  documentationLink = "https://platform.openai.com/docs/api-reference/chat";

  async generate(config: BackendProviderGenerateConfig): Promise<BackendProviderGenerateResponse> {
    const {
      baseUrl = BASE_URL,
      key = globalSettings.openaiKey,

      maxTokens,
      messages,
      model,
      stopSequences,
      stream,
      system,
      temperature,
      thinking,
      topK,
      topP,

      onUpdate,
      abortController,
    } = config;

    const requestBody: OpenaiRequest = {
      max_completion_tokens: maxTokens,
      messages: messages,
      model: model,
      stop: stopSequences,
      stream: stream,
      stream_options: stream ? { "include_usage": true } : undefined,
      // system: system,
      temperature: temperature,
      // thinking: thinking ? { budget_tokens: thinking, type: "enabled" } : undefined,
      // top_k: topK,
      top_p: topP,
    };
    const url = `${stripLastSlash(baseUrl)}/chat/completions`;

    let response: AxiosResponse;
    try {
      response = await axios.post(url, requestBody, {
        signal: abortController?.signal,
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

    let lastResponse: ResponseParserMessage | null = null;

    const onData = (data: ResponseParserMessage) => {
      lastResponse = data;
      onUpdate?.({ chunk: data.chunk });
    };

    const onDone = () => {
      reader.cancel("DONE");
    };

    const contentType = response?.headers["content-type"];
    const isStream = contentType?.includes("text/event-stream");

    const parser = isStream
      ? this.createStreamParser(onData, onDone)
      : this.createJsonParser(onData, onDone);

    const reader = (response.data as ReadableStream)
      .pipeThrough(new TextDecoderStream())
      .getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        parser(value);
      }
    } catch (e) {
      if (!lastResponse) lastResponse = {
        message: "",
        chunk: "",
        error: undefined,
        inputTokens: 0,
        outputTokens: 0,
      };
      lastResponse.error = (e as Error).message;
    }

    const { message = "", error = undefined, inputTokens = 0, outputTokens = 0 } = lastResponse ?? {};
    return {
      message: message.trim(),
      error,
      url,
      request: requestBody,
      inputTokens,
      outputTokens,
    };
  }

  private createStreamParser: ResponseParser = (onData, onDone) => {
    const dataPrefix = "data: ";
    let chunk = "";
    let message = "";
    let error: string | undefined;

    return (text: string) => {
      const events = text.split("\n\n");
      events.forEach(event => {
        chunk = "";
        if (event.startsWith(dataPrefix)) {
          event = event.slice(dataPrefix.length);
          if (event.trim() === "[DONE]") {
            onDone();
            return;
          }
          const data = parseJSON(event) as OpenaiStreamResponse;
          if (!data || !data.choices) return;
          data.choices.map(choice => {
            if (choice.finish_reason && choice.finish_reason !== "stop") {
              error = "finishReason: " + choice.finish_reason;
            }
            if (choice.delta?.content) {
              chunk += choice.delta.content;
              message += choice.delta.content;
            }
          });
          onData({
            message,
            chunk,
            error,
            inputTokens: 0,
            outputTokens: 0,
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
      if (key === "choices") {
        const value = data.value as OpenaiResponse["choices"];
        const choice = value[0];
        if (choice.finish_reason !== "stop") error = "finishReason: " + choice.finish_reason;
        if (choice.message.refusal) error = "refusal: " + choice.message.refusal;
        if (choice.message.content) message = choice.message.content;
      }
      if (key === "usage") {
        const usage = data.value as OpenaiResponse["usage"];
        inputTokens = usage.prompt_tokens;
        outputTokens = usage.completion_tokens;
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

  // ============================================================================

  getModelsOptions(connectionProxy?: ConnectionProxy): Promise<BackendProviderGetModelsResponse> {
    const baseUrl = connectionProxy?.baseUrl || BASE_URL;
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