import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import _isObjectLike from "lodash/isObjectLike";
import { AxiosResponse } from "axios";
import { JSONParser, ParsedElementInfo } from "@streamparser/json";

export type ResponseParserMessage = {
  message?: string;
  chunk?: string;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
}

type ResponseParserConfig = {
  response: AxiosResponse,
  stop?: string[],
  onUpdate: (event: BackendProviderOnUpdateEvent) => void,
  parseStreamEvent: (event: string) => ResponseParserMessage | "DONE" | undefined,
  parseJson: (data: ParsedElementInfo.ParsedElementInfo) => ResponseParserMessage | "DONE" | undefined,
}

// ============================================================================

export abstract class BaseBackendProvider {
  abstract baseUrl: string;
  abstract documentationLink: string;

  abstract config: PresetFieldConfig[];

  abstract generate(config: BackendProviderGenerateConfig): Promise<BackendProviderGenerateResponse>

  abstract getModelsOptions(connectionProxy?: ConnectionProxy): Promise<BackendProviderGetModelsResponse>

  abstract getRequestMessages(requestBody: Record<string, any>): PresetPrompt

  protected extractModels(response: Record<string, any>): { value: string, label: string }[] {
    if (!_isObjectLike(response)) throw "Wrong content type";

    // gemini style
    if (Array.isArray(response.models)) return response.models.map(model => {
      const name = model.name.replace("models/", "");
      return {
        label: name,
        value: name,
      };
    });

    // openai style
    if (Array.isArray(response.data)) return response.data.map(model => ({
      label: model.id,
      value: model.id,
    }));

    throw "Unknown response";
  }

  protected async createResponseParser(config: ResponseParserConfig) {
    const { response, stop, onUpdate, parseStreamEvent, parseJson } = config;
    const hasStop = Array.isArray(stop) && stop.length;

    let stoped = false;
    let message = "";
    let error: string | undefined;
    let inputTokens = 0;
    let outputTokens = 0;

    const contentType = response?.headers["content-type"];
    const isStream = contentType?.includes("text/event-stream");

    const reader = (response.data as ReadableStream)
      .pipeThrough(new TextDecoderStream())
      .getReader();

    const processParserResponse = (response: ResponseParserMessage | "DONE" | undefined) => {
      if (stoped) return;
      if (!response) return;
      if (response === "DONE") {
        reader.cancel("DONE");
        return;
      }

      if (response.message !== undefined) {
        message = response.message;
      } else if (response.chunk !== undefined) {
        message += response.chunk;
      }
      if (response.error !== undefined) error = response.error;
      if (response.inputTokens !== undefined) inputTokens = response.inputTokens;
      if (response.outputTokens !== undefined) outputTokens = response.outputTokens;

      if (error) {
        // reader.cancel(error);
        // return;
      }

      if (hasStop) {
        const stopIndices = stop.map(s => message.indexOf(s)).filter(i => i !== -1);
        if (stopIndices.length) {
          const prefixIndex = Math.min(...stopIndices);
          message = message.slice(0, prefixIndex);
          reader.cancel("stop string");
          stoped = true;
          return;
        }
      }

      if (response.chunk) {
        onUpdate({ chunk: response.chunk });
      }
    };

    const parser = new JSONParser();
    parser.onValue = (data) => {
      const parsedEvent = parseJson(data);
      processParserResponse(parsedEvent);
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (isStream) {
          const events = value.split("\n");
          events.forEach(event => {
            const parsedEvent = parseStreamEvent(event.trim());
            processParserResponse(parsedEvent);

          });
        } else {
          parser.write(value);
        }
      }
    } catch (e) {
      error = (e as Error).message;
    }

    return {
      message: message.trim(),
      error,
      inputTokens,
      outputTokens,
    };
  }
}