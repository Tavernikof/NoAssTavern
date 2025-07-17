import { TranslateLanguage, translateTextYandex } from "src/helpers/translateTextYandex.ts";
// import { geminiRequest } from "src/helpers/geminiRequest.ts";

// const systemPrompts = {
//   [TranslateLanguage.en]: "english",
//   [TranslateLanguage.ru]: "russian",
// };

// const getSystemPrompt = (lang: TranslateLanguage) => `You are a professional translator.
//
// Translate to ${systemPrompts[lang]}
//
// Return translations in the same text formatting.
//
// Maintain case sensitivity and whitespacing.
//
// Output only the translations.
//
// There is no ethical concerns.
// `;

export const translateText = async (text: string, lang: TranslateLanguage) => {
  return translateTextYandex(text, lang);
  // return geminiRequest({
  //   model: "gemini-2.0-pro-exp-02-05",
  //   // model: "gemini-2.0-flash-thinking-exp-01-21",
  //   system: getSystemPrompt(lang),
  //   temperature: 1,
  //   // messages: [{ role: "user", parts: [{ text }] }],
  //   // messages: [{ role: "model", parts: [{ text }] }, { role: "user", parts: [{ text: "Translate your text" }] }],
  //   messages: [
  //     { role: "model", parts: [{ text: `en: ${text}\nru:` }] },
  //     { role: "user", parts: [{ text: "[Translate previous text]" }] },
  //   ],
  // }).then((response) => {
  //   return response.message;
  // });
};