import * as React from "react";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import { Textarea } from "src/components/Form";
import { observer } from "mobx-react-lite";
import MarkdownRenderer from "src/components/MarkdownRenderer";

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
    <MarkdownRenderer>{message.message}</MarkdownRenderer>
  );
};

export default observer(AssistantChatMessageContent) as typeof AssistantChatMessageContent;
