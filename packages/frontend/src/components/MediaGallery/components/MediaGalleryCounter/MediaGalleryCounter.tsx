import * as React from "react";
import { observer } from "mobx-react-lite";
import { MediaEditorController } from "src/components/MediaGallery/helpers/MediaEditorState.ts";

type Props = {
  controller: MediaEditorController;
};

const MediaGalleryCounter: React.FC<Props> = ({ controller }) => {
  const count = controller.mediaFiles.length;
  return count ? <>({count})</> : null;
};

export default observer(MediaGalleryCounter) as typeof MediaGalleryCounter;
