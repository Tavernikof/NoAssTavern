import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import _isObjectLike from "lodash/isObjectLike";
import { AxiosResponse } from "axios";
import { JSONParser, ParsedElementInfo } from "@streamparser/json";

export type ResponseParserImage = {
  data: string,
  mimeType: string,
}
export type ResponseParserMessage = {
  message?: string;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
  images?: ResponseParserImage[];
}

type ResponseParserConfig = {
  response: AxiosResponse,
  stop?: string[],
  onUpdate: (event: BackendProviderOnUpdateEvent) => void,
  parseJson: (data: ParsedElementInfo.ParsedElementInfo) => ResponseParserMessage | "DONE" | undefined,
}

// ============================================================================
const DATA_PREFIX = "data: ";

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
    const { response, stop, onUpdate, parseJson } = config;
    const hasStop = Array.isArray(stop) && stop.length;

    let stoped = false;
    let message = "";
    let images: ResponseParserImage[] | undefined;
    let error: string | undefined;
    let inputTokens = 0;
    let outputTokens = 0;

    const contentType = response?.headers["content-type"];
    const isStream = contentType?.includes("text/event-stream");

    const reader = (response.data as ReadableStream)
      .pipeThrough(new TextDecoderStream())
      .getReader();

    const createParser = () => {
      const parser = new JSONParser();
      parser.onValue = (data) => {
        const response = parseJson(data);
        if (stoped) return;
        if (!response) return;
        if (response === "DONE") {
          reader.cancel("DONE");
          return;
        }

        if (response.message !== undefined) {
          message += response.message;
          onUpdate({ chunk: response.message });

        }
        if (Array.isArray(response.images)) {
          if (!Array.isArray(images)) images = [];
          images.push(...response.images);
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
      };
      parser.onEnd = () => {
        recreateParser();
      };
      return parser;
    };
    const recreateParser = () => {
      parser = createParser();
    };
    let parser = createParser();

    let eventBuffer = "";
    const processData = () => {
      if (!eventBuffer) return;

      if (eventBuffer.startsWith(DATA_PREFIX)) {
        eventBuffer = eventBuffer.slice(DATA_PREFIX.length);
        eventBuffer.trim();
        if (eventBuffer === "[DONE]") {
          stoped = true;
          return;
        }

        if (eventBuffer) parser.write(eventBuffer);
      }

      eventBuffer = "";
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          processData();
          break;
        }

        if (isStream) {
          const events = value.split("\n");
          events.forEach((event, i) => {
            if (stoped) return;

            const isFirst = i === 0;
            const isLast = i === events.length - 1;
            if (isFirst) {
              eventBuffer += event;
            } else {
              eventBuffer = event;
            }
            if (!isLast) processData();
          });
        } else {
          parser.write(value);
        }
      }
    } catch (e) {
      console.error(e);
      error = (e as Error).message;
    }

    message = message.trim();
    if (!message && !images?.length && !error) {
      error = "empty response";
    }

    return {
      message,
      images,
      error,
      inputTokens,
      outputTokens,
    };
  }
}