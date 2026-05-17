import { defineConfig } from "vitepress";

const base = process.env.DOCS_BASE_PATH || "/docs/";

export default defineConfig({
  base,

  ignoreDeadLinks: [
    /^http:\/\/localhost/,
  ],

  head: [
    ["link", { rel: "icon", href: `${base}favicon.ico` }],
  ],

  markdown: {
    config(md) {
      const defaultCodeInline = md.renderer.rules.code_inline!;
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
        tokens[idx].attrSet("v-pre", "");
        return defaultCodeInline(tokens, idx, options, env, self);
      };
    },
  },

  locales: {
    root: {
      title: "NoassTavern",

      label: "Русский",
      lang: "ru",
      themeConfig: {
        nav: [
          { text: "Гайды", link: "/ru/guide/getting-started" },
          { text: "Возможности", link: "/ru/features/chats" },
        ],
        sidebar: {
          "/ru/guide/": [
            {
              text: "Введение",
              items: [
                { text: "Начало работы", link: "/ru/guide/getting-started" },
                { text: "Установка", link: "/ru/guide/installation" },
                { text: "Быстрый старт", link: "/ru/guide/quick-start" },
              ],
            },
          ],
          "/ru/features/": [
            {
              text: "Основные возможности",
              items: [
                { text: "Чаты", link: "/ru/features/chats" },
                { text: "Персонажи", link: "/ru/features/characters" },
                { text: "Флоу", link: "/ru/features/flows" },
                { text: "Промпты", link: "/ru/features/prompts" },
                { text: "Код-блоки", link: "/ru/features/code-blocks" },
                { text: "Медиа файлы", link: "/ru/features/media" },
              ],
            },
            {
              items: [
                { text: "Режим ассистента", link:  "/ru/features/assistant" },
                { text: "Саммари", link: "/ru/features/summary" },
                { text: "Перевод через LLM", link: "/ru/features/llm-translate" },
                { text: "Форматирование сообщений", link: "/ru/features/format-message" },
              ],
            },
          ],
        },
      },
    },
  },

  // Enable local search
  themeConfig: {
    search: {
      provider: "local",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Tavernikof/NoassTavern" },
    ],

    footer: {
      message: "Released under the GNU License.",
      copyright: `Copyright © ${new Date().getFullYear()} NoassTavern`,
    },

    editLink: {
      pattern: "https://github.com/Tavernikof/NoassTavern/edit/main/packages/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
