import { BaseBackendProvider } from "src/helpers/backends/BaseBackendProvider.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import parseJSON from "src/helpers/parseJSON.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import axios from "axios";
import { stripLastSlash } from "src/helpers/stripLastSlash.ts";
import { PresetFieldType } from "src/enums/PresetFieldType.ts";

// ============================================================================

type ClauseStopReason =
  | "end_turn"
  | "max_tokens"
  | "stop_sequence"
  | "tool_use"
  ;

type ClaudeResponse = {
  "id": string,
  "type": "message",
  "role": "assistant",
  "model": string,
  "content": [
    {
      "type": "text",
      "text": string
    }
  ],
  "stop_reason": ClauseStopReason | string,
  "stop_sequence": string | null,
  "usage": {
    "input_tokens": number,
    "cache_creation_input_tokens": number,
    "cache_read_input_tokens": number,
    "output_tokens": number
  },
}

type ClaudeModelsResponse = {
  "data": {
    "type": "model",
    "id": string,
    "display_name": string,
    "created_at": string
  }[],
  "has_more": boolean,
  "first_id": string
  "last_id": string
}

type ClaudeConfig = {
  stream: boolean;
  temperature: number;
  stopSequences: string[];
  clientOnlyStop: boolean;
  maxOutputTokens: number;
  system: string;
  topP: number;
  topK: number;
}

// ============================================================================

class ClaudeProvider extends BaseBackendProvider {
  baseUrl =  "https://api.anthropic.com/v1";
  documentationLink = "https://docs.anthropic.com/en/api/messages";

  config: PresetFieldConfig[] = [
    { name: "stream", label: "Stream", type: PresetFieldType.checkbox },
    { name: "temperature", label: "temperature", type: PresetFieldType.number },
    { name: "stopSequences", label: "stopSequences", type: PresetFieldType.stringArray },
    { name: "clientOnlyStop", label: "Client-only stop string", type: PresetFieldType.checkbox },
    { name: "maxOutputTokens", label: "Мax tokens", type: PresetFieldType.number },
    { name: "system", label: "System prompt", type: PresetFieldType.textarea },
    { name: "topP", label: "topP", type: PresetFieldType.number },
    { name: "topK", label: "topK", type: PresetFieldType.number },
  ];

  async generate(config: BackendProviderGenerateConfig<ClaudeConfig>): Promise<BackendProviderGenerateResponse> {
    const {
      messageController,
      model,
      baseUrl = this.baseUrl,
      key = globalSettings.claudeKey,
      messages,
      onUpdate,
      abortController,

      generationConfig: {
        stream,
        temperature,
        stopSequences,
        clientOnlyStop,
        maxOutputTokens,
        system,
        topP,
        topK,
      },
    } = config;

    const stop = clientOnlyStop ? undefined : this.prepareStop(stopSequences, messageController);

    const requestBody = {
      max_tokens: maxOutputTokens,
      messages: messages,
      model: model,
      stop_sequences: stop,
      stream: stream,
      system: system,
      temperature: temperature,
      // thinking: thinking ? { budget_tokens: thinking, type: "enabled" } : undefined,
      top_k: topK,
      top_p: topP,
    };

    const url = `${baseUrl}/messages`;
    const response = await fetch(url, {
      method: "POST",
      signal: abortController?.signal,
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": key,
      },
    });

    if (response.status !== 200) {
      const message = await response.json();
      return {
        message: "",
        error: JSON.stringify(message),
        url,
        request: requestBody,
        inputTokens: 0,
        outputTokens: 0,
      };
    }

    const contentType = response.headers.get("content-type");
    const isStream = contentType?.includes("text/event-stream");

    if (isStream) {
      if (!response.body) {
        return {
          message: "",
          error: "Body not found",
          url,
          request: requestBody,
          inputTokens: 0,
          outputTokens: 0,
        };
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let message = "";
      let chunk = "";
      let inputTokens = 0;
      let outputTokens = 0;
      while (true) {
        const { value, done } = await reader.read();
        console.log(value);
        if (done) break;
        const events: Record<string, any>[] = [];
        value.split("\n\n").map(event => event.split("\n").forEach(part => {
          if (part.startsWith("data:")) {
            const data = parseJSON(part.replace("data:", ""));
            if (data) events.push(data);
          }
        }));
        console.log(events);
        chunk = "";
        events.forEach(event => {
          if (event.type === "content_block_start") {
            chunk += event.content_block.text;
          }
          if (event.type === "content_block_delta") {
            chunk += event.delta.text;
          }
          if (event.type === "message_start") {
            inputTokens = event.message?.usage?.input_tokens;
          }
          if (event.type === "message_delta") {
            outputTokens = event.usage?.output_tokens;
          }
        });
        message += chunk;
        onUpdate?.({ chunk });
      }

      return {
        message,
        error: undefined,
        inputTokens,
        outputTokens,
        url,
        request: requestBody,
      };
    }

    const data = await response.json() as ClaudeResponse;
    const message = data.content?.map(c => c.text).join("") ?? "";
    let error: string | undefined;

    if (data.stop_reason !== "end_turn" && data.stop_reason !== "stop_sequence") {
      error = `stopReason: ${data.stop_reason}`;
    }

    return {
      message,
      error,
      url,
      request: requestBody,
      inputTokens: 0,
      outputTokens: 0,
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

export const claudeProvider = new ClaudeProvider();