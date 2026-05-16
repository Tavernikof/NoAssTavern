import DOMPurify from "dompurify";
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

const applyDefaultStyle = (message: string) => {
  return message
    .split("\n")
    .map(paragraph => {
      let finalText = "";
      const { tokens } = parseSpecialTokens(paragraph.trim());
      tokens.forEach(({ token, text }) => {
        finalText += token
          ? `<span class="${token ? tokenClassNameMap[token[0]] : ""}">${text}</span>`
          : text;
      });
      if (!finalText) return "";
      return `<div class="${sharedStyle.paragraph}">${finalText}</div>`;
    })
    .filter(Boolean)
    .join("\n");
};

const skipStyleTags = new Set(["STYLE", "SCRIPT"]);

const applyDefaultStyleToElement = (dom: Element) => {
  const walker = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (parent && skipStyleTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const template = document.createElement("template");
    template.innerHTML = applyDefaultStyle(node.textContent ?? "");
    node.parentNode?.replaceChild(template.content, node);
  }
};

const isLink = (node: Node): node is HTMLLinkElement => node.nodeName === "A";

const isMailLink = (link: string) => link.startsWith("mailto:");

const addTargetBlankToNode = (node: Element) => {
  if (isLink(node)) {
    if (isMailLink(node.href)) {
      node.removeAttribute("target");
      node.removeAttribute("rel");
    } else {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  }
};

const FORBID_TAGS = [
  "title",
  "form", "input", "button", "textarea",
  "select", "option", "optgroup", "datalist",
  "label", "fieldset", "legend",
  "output", "progress", "meter",
  "iframe", "frame", "frameset", "object", "embed", "applet",
  "dialog",
];

const FORBID_ATTR = [
  "popover", "popovertarget", "popovertargetaction",
  "formaction", "formmethod", "formenctype", "formnovalidate", "formtarget",
  "autofocus", "tabindex", "accesskey", "contenteditable", "draggable",
];

const cleanHtml = (message: string) => {
  DOMPurify.addHook("afterSanitizeAttributes", addTargetBlankToNode);
  const dom = DOMPurify.sanitize(message, {
    ADD_TAGS: ["style"],
    FORBID_TAGS,
    FORBID_ATTR,
    FORCE_BODY: true,
    RETURN_DOM: true,
  }) as Element;
  DOMPurify.removeHook("afterSanitizeAttributes", addTargetBlankToNode);
  return dom;
};

const escapeHtmlTags = (message: string) => {
  return message
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};

type ParseTextConfig = {
  message: string
  skipDefaultStyle?: boolean;
  allowHtml: boolean;
}

export const parseText = (config: ParseTextConfig) => {
  const { message, skipDefaultStyle, allowHtml } = config;
  let text = message;
  let hasStyle = false;
  if (allowHtml) {
    const dom = cleanHtml(text);
    applyDefaultStyleToElement(dom);
    text = dom.innerHTML;
    hasStyle = Boolean(dom.querySelector("style") || dom.querySelector("*[style]"));
  } else {
    text = escapeHtmlTags(text);
    if (!skipDefaultStyle) text = applyDefaultStyle(text);
  }
  return {
    text,
    hasStyle,
  };
};
