import * as React from "react";
import { useChatMessageContext } from "src/routes/SingleChat/helpers/ChatMessageContext.ts";
import { observer } from "mobx-react-lite";
import { parseText } from "../../helpers/parseText.ts";
import ShadowedContent from "src/routes/SingleChat/components/ShadowedContent";

type Props = Record<string, never>;

const FormattedMessage: React.FC<Props> = () => {
  const { chatMessage } = useChatMessageContext();
  const { formattedMessage, formattedTranslate, message, translate, showTranslate } = chatMessage;
  const { message: finalMessage, skipDefaultStyle, allowHtml } = (showTranslate && translate?.message)
    ? formattedTranslate?.message ? formattedTranslate : translate
    : formattedMessage?.message ? formattedMessage : message;

  const { text: finalText, hasStyle } = React.useMemo(() => parseText({
    message: finalMessage,
    skipDefaultStyle,
    allowHtml,
  }), [finalMessage, skipDefaultStyle, allowHtml]);

  return (
    hasStyle
      ? <ShadowedContent content={finalText} />
      : <div dangerouslySetInnerHTML={{ __html: finalText }} />
  );
};

export default observer(FormattedMessage) as typeof FormattedMessage;
