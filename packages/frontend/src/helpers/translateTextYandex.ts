import { v4 as uuidv4 } from "uuid";
import { parseSpecialTokens } from "src/routes/SingleChat/helpers/parseText.ts";
import { backendManager } from "src/store/BackendManager.ts";

// import { translate } from "google-translate-api-browser";

export enum TranslateLanguage {
  ru = "ru",
  en = "en",
}

export const translateTextYandex = async (text: string, lang: TranslateLanguage) => {
  if (!text) return Promise.resolve("");
  const paragraphs = text.split("\n");
  const parsedParagraphs = paragraphs.map(paragraph => parseSpecialTokens(paragraph).tokens);

  const finalTexts: string[] = [];
  parsedParagraphs.forEach(paragraph => {
    paragraph.forEach(({ token, text }) => {
      finalTexts.push(token ? text.slice(token[0].length, -token[1].length) : text);
    });
  });

  const finalText = finalTexts.join("\n\n");

  return yandexTranslate(finalText, lang).then(translatedText => {
    const translatedChunks = translatedText.split("\n\n");

    let i = 0;
    return parsedParagraphs.map((paragraph) => {
      return paragraph.map(({ token }) => {
        const translatedChunk = translatedChunks[i++];
        return token ? `${token[0]}${translatedChunk}${token[1]}` : translatedChunk;
      }).join("");
    }).join("\n");
  });

};

// const googleTranslate = (text: string, lang: TranslateLanguage) => {
//   return translate(text, { to: lang }).then(res => res.text);
// };

const yandexTranslate = (text: string, lang: TranslateLanguage): Promise<string> => {
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("lang", lang);

  const ucid = uuidv4().replaceAll("-", "");

  return backendManager.externalRequest<{ text: string[] }>({
    method: "POST",
    url: `https://translate.yandex.net/api/v1/tr.json/translate?ucid=${ucid}&srv=android&format=text`,
    data: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(resp => resp.data.text.join(""));
};