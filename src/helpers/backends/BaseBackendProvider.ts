import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import _isObjectLike from "lodash/isObjectLike";
import { AxiosError } from "axios";

export abstract class BaseBackendProvider {
  abstract documentationLink: string;

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

  protected getAxiosError = async (response: AxiosError): Promise<string> => {
    const data = response.response?.data as any;
    if (data) {
      if (data instanceof ReadableStream) {
        const { value } = await data.pipeThrough(new TextDecoderStream()).getReader().read();
        if (value) return value;
      } else {
        const message = data?.error?.message ?? data.error;
        return (_isObjectLike(message) ? JSON.stringify(message) : message) ?? JSON.stringify(data);
      }
    }
    if (response.message) return `${response.code} ${response.message}`;
    return "Unknown error";
  };

  protected extractAxiosError = (response: AxiosError) => {
    return this.getAxiosError(response).then(error => Promise.reject(error));
  };
}