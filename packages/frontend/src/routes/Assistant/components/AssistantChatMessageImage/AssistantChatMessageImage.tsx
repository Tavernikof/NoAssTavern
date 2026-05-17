import * as React from "react";
import style from "./AssistantChatMessageImage.module.scss";
import { observer } from "mobx-react-lite";
import { filesManager } from "src/store/FilesManager.ts";

type Props = {
  imageId: string;
};

const AssistantChatMessageImage: React.FC<Props> = (props) => {
  const { imageId } = props;

  const src = imageId ? filesManager.cache[imageId] : null;

  React.useEffect(() => {
    if (imageId) filesManager.loadFileCacheInCache(imageId);
  }, [imageId]);

  if (!src) return null;
  return (
    <img className={style.image} src={src} alt={imageId} />
  );
};

export default observer(AssistantChatMessageImage) as typeof AssistantChatMessageImage;
