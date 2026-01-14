const openTag = "{{";
const closeTag = "}}";

export const prepareMessage = async (message: string, vars: PresetVars): Promise<string> => {
  let result = "";
  let lastIndex = 0;

  while (lastIndex < message.length) {
    const startIndex = message.indexOf(openTag, lastIndex);

    // If no more '{{' are found, append the rest of the string and finish.
    if (startIndex === -1) {
      result += message.substring(lastIndex);
      break;
    }

    // Append the text between the last position and the start of the new tag.
    result += message.substring(lastIndex, startIndex);

    // Now, find the matching '}}' for the '{{' at startIndex.
    // We need to account for nested tags.
    let braceLevel = 1;
    let searchIndex = startIndex + openTag.length;
    let endIndex = -1;

    while (searchIndex < message.length) {
      const nextOpenIndex = message.indexOf(openTag, searchIndex);
      const nextCloseIndex = message.indexOf(closeTag, searchIndex);

      // If no more closing tags can be found, this tag is unclosed.
      if (nextCloseIndex === -1) {
        break;
      }

      // If an opening tag appears before the next closing tag, it's a nested tag.
      if (nextOpenIndex !== -1 && nextOpenIndex < nextCloseIndex) {
        braceLevel++;
        searchIndex = nextOpenIndex + openTag.length;
      } else {
        // Otherwise, we've found a closing tag.
        braceLevel--;
        // If the brace level is 0, we've found the matching closing tag.
        if (braceLevel === 0) {
          endIndex = nextCloseIndex;
          break;
        }
        searchIndex = nextCloseIndex + closeTag.length;
      }
    }

    // If we found a complete, balanced tag
    if (endIndex !== -1) {
      const varName = message.substring(startIndex + openTag.length, endIndex);
      const match = varName.match(/^([\w_]*)(.*?)$/s);

      if (match) {
        const [substring, variableName, rawArguments] = match;

        if (typeof variableName === "string") {
          const variable = vars[variableName];
          const varResult = typeof variable === "function" ? await variable(rawArguments) : variable;

          if (typeof varResult === "string") {
            result += await prepareMessage(varResult, vars);
          } else {
            result += openTag + substring + closeTag;
          }
        } else {
          result += openTag + substring + closeTag;
        }
      }

      lastIndex = endIndex + closeTag.length;
    } else {
      // If we didn't find a matching endIndex, the tag was unclosed.
      // Treat the '{{' as literal text and continue parsing after it.
      result += message.substring(startIndex, startIndex + openTag.length);
      lastIndex = startIndex + openTag.length;
    }
  }

  return result;
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
