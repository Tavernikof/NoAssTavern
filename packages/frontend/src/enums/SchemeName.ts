import createDictionary from "src/helpers/createDictionary.ts";

export enum SchemeName {
  main = "main",
  // userMessage = "userMessage",
  generate = "generate",
  translate = "translate",
}

const defaultSchemes = [
  { id: SchemeName.main, label: "Main", note: "Fires when the \"Send message\" button is pressed." },
  // { id: SchemeName.userMessage, label: "User message", note: "" },
  {
    id: SchemeName.generate,
    label: "Generate",
    note: "Fires when the \"Change swipe\" or \"Regenerate\" button is pressed",
  },
  { id: SchemeName.translate, label: "Translate", note: "Fires when the \"Translate\" button is pressed" },
];

export const defaultSchemesDict = createDictionary({
  list: defaultSchemes,
  formatLabel: (item) => item.label,
});

export const isDefaultScheme = (schemeName: string): schemeName is SchemeName => {
  return Object.prototype.hasOwnProperty.call(defaultSchemesDict.dict, schemeName);
}