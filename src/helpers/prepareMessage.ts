export const prepareMessage = (message: string, vars: PresetVars): string => {
  return message.replace(/{{([\w_]*)(.*?)}}/g, (substring, variableName, rawArguments) => {
    if (typeof variableName !== "string") return substring;

    const variable = vars[variableName];
    const result = typeof variable === "function" ? variable(rawArguments) : variable;
    if (typeof result === "string") return prepareMessage(result, vars);

    return substring;
  });
};