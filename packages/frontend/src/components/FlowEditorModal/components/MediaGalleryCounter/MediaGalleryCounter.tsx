import * as React from "react";
import { useFlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const MediaGalleryCounter: React.FC<Props> = () => {
  const flowEditor = useFlowEditorContext();
  const count = flowEditor.mediaFiles.length;

  return count ? `(${count})` : null;
};

export default observer(MediaGalleryCounter) as typeof MediaGalleryCounter;
