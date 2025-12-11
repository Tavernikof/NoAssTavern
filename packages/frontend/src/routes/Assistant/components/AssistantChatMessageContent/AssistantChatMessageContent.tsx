import * as React from "react";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import { Textarea } from "src/components/Form";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeHighlightLines from "rehype-highlight-code-lines";
import "src/styles/github-markdown-css.css";
import "highlight.js/styles/atom-one-dark.css";
import "src/styles/prism-one-dark.css";
import "./AssistantChatMessageContent.module.scss";
import { observer } from "mobx-react-lite";

type Props = {
  assistantMessage: AssistantMessageController
};

const AssistantChatMessageContent: React.FC<Props> = (props) => {
  const { assistantMessage } = props;
  const { editable, message } = assistantMessage;

  if (editable) return (
    <Textarea
      ref={assistantMessage.setEditorTextarea}
      autoHeight
      defaultValue={message.message}
      onKeyDown={(e) => {
        if (e.key === "Escape") assistantMessage.setEditable(false);
      }}
    />
  );
  return (
    <div className="markdown-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeHighlight, { detect: true }],
          [rehypeHighlightLines, { showLineNumbers: true }],
          // [rehypePrism, { showLineNumbers: true }],
        ]}
        // components={{
        //   code(props) {
        //     const { children, className, node, ...rest } = props;
        //     const match = /language-(\w+)/.exec(className || "");
        //     return match ? (
        //       <SyntaxHighlighter
        //         {...rest}
        //         PreTag="div"
        //         children={String(children).replace(/\n$/, "")}
        //         language={match[1]}
        //         style={oneDark}
        //         showLineNumbers
        //       />
        //     ) : (
        //       <code {...rest} className={className}>
        //         {children}
        //       </code>
        //     );
        //   },
        // }}
      >
        {message.message}
      </Markdown>
    </div>
  );
};

export default observer(AssistantChatMessageContent) as typeof AssistantChatMessageContent;
