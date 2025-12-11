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

  const finalText = chunkTexts(finalTexts, 3000)
    .map(arr => arr.join("\n\n"));

  return Promise.all(finalText.map(text => yandexTranslate(text, lang))).then(translatedTexts => {
    const translatedChunks = translatedTexts.join('\n\n').split("\n\n");

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


function chunkTexts(texts: string[], maxLength: number): string[][] {
  // Если входной массив пуст, возвращаем пустой массив
  if (!texts || texts.length === 0) {
    return [];
  }

  const result: string[][] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const text of texts) {
    const textLength = text.length;

    // Важный пограничный случай: если одна строка сама по себе длиннее, чем maxLength,
    // она все равно должна попасть в свой собственный чанк.
    // Наша логика это учтет: currentChunk будет пуст, и строка просто добавится в него.

    // Проверяем: если текущий чанк НЕ пустой И добавление новой строки превысит лимит...
    if (currentChunk.length > 0 && currentLength + textLength > maxLength) {
      // ...тогда "закрываем" текущий чанк, добавляя его в результат
      result.push(currentChunk);

      // И начинаем новый чанк с текущей строки
      currentChunk = [text];
      currentLength = textLength;
    } else {
      // В противном случае (если чанк пуст или строка помещается),
      // просто добавляем строку в текущий чанк
      currentChunk.push(text);
      currentLength += textLength;
    }
  }

  // После окончания цикла не забываем добавить последний собранный чанк,
  // если он не пустой.
  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
}
