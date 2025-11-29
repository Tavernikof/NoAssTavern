import { AxiosError } from "axios";
import _isObjectLike from "lodash/isObjectLike";

export const getAxiosError = async (response: AxiosError): Promise<string> => {
  const data = response.response?.data as any;
  if (data) {
    if (data instanceof ReadableStream) {
      const { value } = await data.pipeThrough(new TextDecoderStream()).getReader().read();
      if (value) return value;
    } else {
      const message = data?.error?.message ?? data.message ?? data.error;
      return (_isObjectLike(message) ? JSON.stringify(message) : message) ?? JSON.stringify(data);
    }
  }
  if (response.message) return `${response.code} ${response.message}`;
  return "Unknown error";
};

export const extractAxiosError = (response: AxiosError) => {
  console.trace(response);
  return getAxiosError(response).then(error => Promise.reject(error));
};
