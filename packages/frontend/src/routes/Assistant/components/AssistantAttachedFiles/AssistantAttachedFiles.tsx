import * as React from "react";
import style from "./AssistantAttachedFiles.module.scss";
import { observer } from "mobx-react-lite";
import { FileText, X } from "lucide-react";
import { useAssistantChatControllerContext } from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import { formatFileSize, isImageMimeType } from "src/helpers/fileMimeType.ts";

type ItemProps = {
  file: File;
  onRemove: () => void;
};

const AttachedFile: React.FC<ItemProps> = ({ file, onRemove }) => {
  const isImage = isImageMimeType(file.type);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  return (
    <div className={style.item} title={file.name}>
      {previewUrl
        ? <img className={style.preview} src={previewUrl} alt={file.name} />
        : <FileText className={style.icon} />}
      <div className={style.info}>
        <div className={style.name}>{file.name}</div>
        <div className={style.size}>{formatFileSize(file.size)}</div>
      </div>
      <button type="button" className={style.remove} onClick={onRemove}><X /></button>
    </div>
  );
};

const AssistantAttachedFiles: React.FC = () => {
  const assistantChatController = useAssistantChatControllerContext();
  const { attachedFiles } = assistantChatController;

  if (!attachedFiles.length) return null;
  return (
    <div className={style.container}>
      {attachedFiles.map((file, index) => (
        <AttachedFile
          key={`${index}-${file.name}-${file.size}-${file.lastModified}`}
          file={file}
          onRemove={() => assistantChatController.removeAttachedFile(index)}
        />
      ))}
    </div>
  );
};

export default observer(AssistantAttachedFiles) as typeof AssistantAttachedFiles;
