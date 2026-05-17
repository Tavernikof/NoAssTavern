# Форматирование сообщений
   
По умолчанию в сообщениях подсвечивается только markdown синтаксис, чтобы оформить сообщение более выразительно можно использовать code block. 

![](/format-message-01.jpg){width=300px}

![](/format-message-02.jpg){width=300px}

![](/format-message-03.png){width=300px}

::: warning Ворнинг
`formatMessage` работает только для Flow
:::

```js
/** @type {FormatMessageFn} */
async function formatMessage(params) {
  // Вырезаем префикс автора из сообщения
  params.message = params.message
    .replaceAll("**Author:**", "")
    .replaceAll("**Автор:**", "")
  ; 
  params.skipDefaultStyle = false;
  params.allowHtml = false;
  return params;
}
```

## Базовое использование
Если дефолтная подсветка прямой речи, мыслей и т.д. мешает, ее можно отключить:
```js
/** @type {FormatMessageFn} */
async function formatMessage(params) {
  // ...
  params.skipDefaultStyle = true;
  return params;
}
```

По умолчанию, в сообщении экранируются html теги, так что если нужно отображать кастомную верстку, надо включить отображение html:
```js
/** @type {FormatMessageFn} */
async function formatMessage(params) {
  // ...
  params.allowHtml = true;
  return params;
}
```
::: info Перфоманс
Включение режима html так же включает встроенный санитайзер. Он вырезает все небезопасные теги и оборачивает сообщение в shadow root, что может бить по перфомансу
:::

## Изображения

Если хочется добавить аватарки, статичные картинки и т.д., есть встроенная функция `getFileUrl(fileName)`.

![](/format-message-06.png){width=300px}

Если изображения с таким именем нет, функция вернет `null`

```js
/** @type {FormatMessageFn} */
async function formatMessage(params) {
  // Получаем аватар по имени файла
  const batrenderAvatar = await getFileUrl("Batrender");

  params.message = batrenderAvatar ? `<img src="${batrenderAvatar}">` : null;
  
  return params;
}
```

По умолчанию доступны аватарки всех персонажей. Если нужны другие аватарки, их надо загрузить как [медиа файлы](/ru/features/media).

::: warning Следи за именами
После загрузки картинки нужно вручную удалить расширение, чтобы имя правильно матчилось
:::

# Полный пример

Готовый пример, который автоматически ищет все префиксы **ИМЯ:** и заменяет его на изображение

```js
// Немного стилей, чтобы аватарка была слева от бабла сообщений
const globalStyle = `
<style>
.row {
  margin: 12px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar {
  flex-shrink: 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.text {
  border-radius: 12px;
  border: 1px solid var(--white20a);
}
</style>
`;

/* 
Функция, которая возвращается объект вида
{
  "ИМЯ_ПЕРСОНАЖА": "http://..."
}
 */
function extractImagesFromNames(message) {
  const uniqueNames = [...new Set([...message.matchAll(/\*\*([^*:]+):\*\*/g)].map(m => m[1]))];

  return Promise.all(uniqueNames.map(async name => [name, await getFileUrl(name)])).then((result) => {
    return Object.fromEntries(result)
  });
}

/** @type {FormatMessageFn} */
async function formatMessage(params) {
  let message = params.message;

  // Достаем все возможные изображения
  const urlMap = await extractImagesFromNames(message);

  const paragraphs =  message
    .split("\n")
    .filter(Boolean)
    .map(paragraph => {
      const match = paragraph.match(/^\*\*([^*:]+):\*\*/);
      if (!match) return paragraph; // Если параграф начинается не с префикса оставляем его как есть
      const [prefix, name] = match;
      if (!name || !urlMap[name]) return paragraph; // Eсли для персонажа нет аватарки, оставляем как есть
      return `
        <div class="row">
          <img class="avatar" src="${urlMap[name]}">
          <div class="text">${paragraph.slice(prefix.length)}</div>
        </div>
      `;
    });

  params.message = globalStyle + paragraphs.join('\n');
  params.allowHtml = true; // Обязательно разрешаем рендерить html

  return params;
}
```

::: info `getFileUrl` Имеет встроенный кеш
 Это тяжелая функция, которая обменивается сообщениями между iframe и основной страницей, поэтому все вызовы автоматически кешируются
:::