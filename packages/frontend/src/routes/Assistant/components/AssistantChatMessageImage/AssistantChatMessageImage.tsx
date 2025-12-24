import * as React from "react";
import { imagesManager } from "src/store/ImagesManager.ts";
import style from "./AssistantChatMessageImage.module.scss";
import { observer } from "mobx-react-lite";

type Props = {
  imageId: string;
};

const AssistantChatMessageImage: React.FC<Props> = (props) => {
  const { imageId } = props;

  const src = imageId ? imagesManager.cache[imageId] : null;

  React.useEffect(() => {
    if (imageId) imagesManager.getItem(imageId);
  }, [imageId]);

  if (!src) return null;
  return (
    <img className={style.image} src={src} alt={imageId} />
  );
};

export default observer(AssistantChatMessageImage) as typeof AssistantChatMessageImage;
