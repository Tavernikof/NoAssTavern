import parseJSON from "src/helpers/parseJSON.ts";

export const parseJsonFile = <D extends Record<string, unknown>>(file: File) => {
  return new Promise<D>((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      res(parseJSON(reader.result as string));
    };
    reader.onerror = () => {
      rej("File read error");
    };
    reader.readAsText(file);
  });
};