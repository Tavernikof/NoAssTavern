import { BaseBackendProvider, ResponseParserMessage } from "src/helpers/backends/BaseBackendProvider.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import { stripLastSlash } from "src/helpers/stripLastSlash.ts";
import { PresetFieldType } from "src/enums/PresetFieldType.ts";
import { extractAxiosError, getAxiosError } from "src/helpers/getAxiosError.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { AxiosError, AxiosResponse } from "axios";

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
  "content": {
    "type": "text",
    "text": string
  }[],
  "stop_reason": ClauseStopReason,
  "stop_sequence": string | null,
  "usage": {
    "input_tokens": number,
    "cache_creation_input_tokens": number,
    "cache_read_input_tokens": number,
    "cache_creation"?: {
      "ephemeral_5m_input_tokens": number,
      "ephemeral_1h_input_tokens": number,
    },
    "output_tokens": number,
    "service_tier"?: "standard"
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

type ClaudeEventMessageStart = {
  "type": "message_start",
  "message": {
    "id": string,
    "type": "message",
    "role": "assistant",
    "model": string,
    "content": [],
    "stop_reason": null,
    "stop_sequence": null,
    "usage": {
      "input_tokens": number,
      // missed on AWS
      "cache_creation_input_tokens"?: number,
      "cache_read_input_tokens"?: number,
      "cache_creation"?: {
        "ephemeral_5m_input_tokens": number,
        "ephemeral_1h_input_tokens": number,
      },
      "output_tokens": 3,
      "service_tier"?: "standard"
    }
  }
}

type ClaudeEventContentBlockStart = {
  "type": "content_block_start",
  "index": number,
  "content_block": { "type": "text", "text": string }
}

type ClaudeEventContentBlockDelta = {
  "type": "content_block_delta",
  "index": number,
  "delta": { "type": "text_delta", "text": string }
}

type ClaudeEventContentBlockStop = {
  "type": "content_block_stop",
  "index": number
}

type ClaudeEventMessageDelta = {
  "type": "message_delta",
  "delta": { "stop_reason": "end_turn", "stop_sequence": null },
  "usage": {
    // missed on AWS
    "input_tokens"?: 2195,
    "cache_creation_input_tokens"?: 0,
    "cache_read_input_tokens"?: 0,
    "output_tokens": 527
  }
}


type ClaudeEventMessageStop = {
  "type": "message_stop",
  "amazon-bedrock-invocationMetrics"?: { // only at AWS
    "inputTokenCount": number,
    "outputTokenCount": number,
    "invocationLatency": number,
    "firstByteLatency": number
  }
}

type ClaudeStreamEvent =
  | ClaudeEventMessageStart
  | ClaudeEventContentBlockStart
  | ClaudeEventContentBlockDelta
  | ClaudeEventContentBlockStop
  | ClaudeEventMessageDelta
  | ClaudeEventMessageStop

// ============================================================================

class ClaudeProvider extends BaseBackendProvider {
  baseUrl = "https://api.anthropic.com/v1";
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
      model,
      baseUrl = this.baseUrl,
      key = globalSettings.claudeKey,
      messages,
      stop,
      onUpdate,
      abortController,

      generationConfig: {
        stream,
        temperature,
        clientOnlyStop,
        maxOutputTokens,
        system,
        topP,
        topK,
      },
    } = config;

    const requestBody = {
      max_tokens: maxOutputTokens,
      messages: messages,
      model: model,
      stop_sequences: stream && clientOnlyStop ? undefined : stop,
      stream: stream,
      system: system,
      temperature: temperature,
      // thinking: thinking ? { budget_tokens: thinking, type: "enabled" } : undefined,
      top_k: topK,
      top_p: topP,
    };

    let response: AxiosResponse;

    const url = `${stripLastSlash(baseUrl)}/messages`;
    try {
      response = await backendManager.externalRequest({
        method: "POST",
        url: url,
        data: requestBody,
        signal: abortController?.signal,
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": key,
        },
        responseType: "stream",
        adapter: "fetch",
      });
    } catch (response) {
      return {
        message: "",
        error: await getAxiosError(response as AxiosError),
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

      parseJson: (data) => {
        const response: ResponseParserMessage = {};
        const key = data.key;

        if (data.value && typeof data.value === "object" && "type" in data.value) {
          const value = data.value as ClaudeStreamEvent;
          if (value.type === "message_start") {
            response.inputTokens = value.message.usage?.input_tokens;
          } else if (value.type === "content_block_start") {
            response.message = value.content_block?.text || "";
          } else if (value.type === "content_block_delta") {
            response.message = value.delta?.text || "";
          } else if (value.type === "message_delta") {
            const stopReason = value.delta?.stop_reason;
            if (stopReason && stopReason !== "end_turn" && stopReason !== "stop_sequence") {
              response.error = `stopReason: ${stopReason}`;
            }
            response.outputTokens = value.usage?.output_tokens;
          }
        } else if (key === "usage") {
          const value = data.value as ClaudeResponse["usage"];
          response.inputTokens = value.input_tokens;
          response.outputTokens = value.output_tokens;
        } else if (key === "stop_reason") {
          const stopReason = data.value as ClaudeResponse["stop_reason"];
          if (stopReason && stopReason !== "end_turn" && stopReason !== "stop_sequence") {
            response.error = `stopReason: ${stopReason}`;
          }
        } else if (key === "content") {
          const value = data.value as ClaudeResponse["content"];
          response.message = value.map(v => v.text).join("");
        }

        return response;
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
    return backendManager.externalRequest<ClaudeModelsResponse>({
      method: "GET",
      url: `${stripLastSlash(baseUrl)}/${stripLastSlash(modelsEndpoint)}`,
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": key,
        "authorization": `Bearer ${key}`,
      },
    }).then(
      (response) => this.extractModels(response.data),
      extractAxiosError,
    );
  }

  // ============================================================================

  getRequestMessages(request: Record<string, any>): PresetPrompt {
    return request.messages;
  }
}

export const claudeProvider = new ClaudeProvider();