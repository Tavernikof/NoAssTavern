import * as React from "react";
import { Marked } from "marked";
import hljs from "highlight.js";
import styles from "./MarkdownRenderer.module.scss";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const marked = new Marked({
  gfm: true,
  breaks: true,
  tokenizer: {
    html: () => undefined,
  },
  renderer: {
    code({ text, lang }) {
      const language = hljs.getLanguage(lang || "") ? lang : "plaintext";
      const trimmedCode = text.replace(/\n+$/, "");
      const highlighted = hljs.highlight(trimmedCode, { language: language || "plaintext" }).value;
      const numberOfLines = highlighted.split("\n").length;
      const lineNumbers = `<span class="${styles.lineNumbers}">${"<span></span>".repeat(numberOfLines)}</span>`;
      return `<pre class="${styles.codeWithLineNumbers}">${lineNumbers}<code class="language-${language}">${highlighted}</code></pre>`;
    },
    html(content) {
      return escapeHtml(content.text);
    },
  },
});

type Props = {
  children: string;
};

const MarkdownRenderer: React.FC<Props> = ({ children }) => {
  const html = React.useMemo(() => {
    return marked.parse(children, { async: false }) as string;
  }, [children]);

  return (
    <div
      className="markdown"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default React.memo(MarkdownRenderer);
