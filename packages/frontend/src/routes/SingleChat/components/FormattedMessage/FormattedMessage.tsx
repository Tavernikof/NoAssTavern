import * as React from "react";
import { parseSpecialTokens, tokenClassNameMap } from "src/routes/SingleChat/helpers/parseText.ts";
import sharedStyle from "src/routes/SingleChat/ChatShared.module.scss";
import { useChatMessageContext } from "src/routes/SingleChat/helpers/ChatMessageContext.ts";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const FormattedMessage: React.FC<Props> = () => {
  const { chatMessage } = useChatMessageContext();
  const { message, translate, showTranslate } = chatMessage;
  const text = (showTranslate && translate.message) ? translate.message : message.message;

  const formattedMessage = React.useMemo(() => {
    const formattedMessage: React.ReactNode[] = [];
    const paragraphs = text
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean);
    paragraphs.forEach((paragraph, i) => {
      const children: React.ReactNode[] = [];
      const { tokens } = parseSpecialTokens(paragraph);
      tokens.forEach(({ token, text }, j) => {
        children.push(token
          ? <span key={j} className={token ? tokenClassNameMap[token[0]] : undefined}>{text}</span>
          : <React.Fragment key={j}>{text}</React.Fragment>,
        );
      });
      formattedMessage.push(<div key={i} className={sharedStyle.paragraph}>{children}</div>);
    });
    return formattedMessage;
  }, [text]);

  return (
    <>{formattedMessage}</>
  );
};

export default observer(FormattedMessage) as typeof FormattedMessage;
