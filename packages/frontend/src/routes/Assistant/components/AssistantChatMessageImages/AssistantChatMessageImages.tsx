import * as React from "react";
import style from "./AssistantChatMessageImages.module.scss";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import AssistantChatMessageImage from "src/routes/Assistant/components/AssistantChatMessageImage";
import { observer } from "mobx-react-lite";

type Props = {
  assistantMessage: AssistantMessageController
};

const AssistantChatMessageImages: React.FC<Props> = (props) => {
  const { assistantMessage } = props;
  const { message } = assistantMessage;

  if (!message.images) return null;
  return (
    <div className={style.container}>
      {message.images.map((image) => <AssistantChatMessageImage key={image.imageId} imageId={image.imageId} />)}
    </div>
  );
};

export default observer(AssistantChatMessageImages) as typeof AssistantChatMessageImages;
