import sharedStyle from "../ChatShared.module.scss";

export type ParsedTextChunk = {
  start: number;
  end: number;
  token: [string, string] | null;
  text: string;
}

export const tokenClassNameMap: Record<string, string> = {
  "**": sharedStyle.doubleAsterisk,
  "'": sharedStyle.quote,
  "\"": sharedStyle.quote,
  "“": sharedStyle.quote,
  "‘": sharedStyle.quote,
  "`": sharedStyle.backtick,
  "*": sharedStyle.asterisk,
};

const specialTokens = [
  ["**", "**"],
  ["\"", "\""],
  ["“", "”"],
  ["‘", "’"],
  ["`", "`"],
  ["*", "*"],
];

export function parseSpecialTokens(input: string): { tokens: ParsedTextChunk[], error: boolean } {
  const tokens: ParsedTextChunk[] = [];
  let currentIndex = 0;
  let error = false;

  function addToken(start: number, end: number, token: [string, string] | null, text: string) {
    tokens.push({ start, end, token, text });
  }

  while (currentIndex < input.length) {
    let foundToken = false;
    for (const [startToken, endToken] of specialTokens) {
      if (input.startsWith(startToken, currentIndex)) {
        const start = currentIndex;
        currentIndex += startToken.length;

        const endIndex = input.indexOf(endToken, currentIndex);

        if (endIndex !== -1) {
          const text = input.substring(start, endIndex + endToken.length);
          addToken(start, endIndex + endToken.length, [startToken, endToken], text);
          currentIndex = endIndex + endToken.length;
        } else {
          const text = input.substring(start);
          addToken(start, input.length, [startToken, endToken], text);
          currentIndex = input.length;
          error = true;
        }
        foundToken = true;
        break;
      }
    }

    if (!foundToken) {
      let nextSpecialTokenIndex = input.length;
      for (const [startToken] of specialTokens) {
        const index = input.indexOf(startToken, currentIndex);
        if (index !== -1) {
          nextSpecialTokenIndex = Math.min(nextSpecialTokenIndex, index);
        }
      }

      if (nextSpecialTokenIndex > currentIndex) {
        const text = input.substring(currentIndex, nextSpecialTokenIndex);
        addToken(currentIndex, nextSpecialTokenIndex, null, text);
        currentIndex = nextSpecialTokenIndex;
      }
    }
  }

  return { tokens, error };
}

//`GM:` *test "ads"* -> []

// const a = [
//   {start: 0, end: 5, token: '`', text: "`GM:`" },
//   {start: 5, end: 6, token: null, text: " " },
//   {start: 6, end: 18, token: "*", text: " *test \"ads\"*" },
//   ]
//
// // **привет** "как дела?"
// const b = [
//   {start: 0, end: 10, token: '`', text: "`GM:`" },
//   {start: 10, end: 11, token: null, text: " " },
//   {start: 11, end: 22, token: "\"", text: " \"как дела?\"" },
// ]
//
// // "this is broken *text*
// const c = [
//   {start: 0, end: 16, token: '"', text: "\"this is broken " },
//   {start: 16, end: 22, token: "*", text: "*text*" },
// ]
//
// console.log(JSON.stringify(a));
// console.log(JSON.stringify(b));
// console.log(JSON.stringify(c));
