export const prepareMessage = (message: string, vars: PresetVars): string => {
  return message.replace(/{{([\w_]*)(.*?)}}/g, (substring, variableName, rawArguments) => {
    if (typeof variableName !== "string") return substring;

    const variable = vars[variableName];
    const result = typeof variable === "function" ? variable(rawArguments) : variable;
    if (typeof result === "string") return prepareMessage(result, vars);

    return substring;
  });
};

export const prepareCharFields = (message: string, charIndex: number): string => {
  return message
    .replaceAll("{{char}}", `{{char:${charIndex + 1}}}`)
    .replaceAll("{{description}}", `{{description:${charIndex + 1}}}`);
};

export const preparePersonaFields = (message: string): string => {
  return message
    .replaceAll("{{user}}", `{{__user__}}`)
    .replaceAll("{{description}}", `{{__description__}}`)
    .replaceAll("{{char}}", `{{user}}`)
    .replaceAll("{{description}}", `{{persona}}`)
    .replaceAll("{{__user__}}", `{{char}}`)
    .replaceAll("{{__description__}}", `{{persona}}`)
    ;
};

export const prepareImpersonate = (message: string) => message
  .replaceAll("{{user}}", "{{impersonate}}");