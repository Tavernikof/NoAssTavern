import { action } from "mobx";
import parseJSON from "src/helpers/parseJSON.ts";

export const readJsonFromFile = <J extends Record<string, any>>(file: File): Promise<J> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener("load", action(() => {
      const json = parseJSON(reader.result as string);
      if(!json) return rej("Wrong file");
      res(json);
    }));
    reader.readAsText(file);
  });
};