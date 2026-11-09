import * as React from "react";
import style from "./AssistantChatMessageFiles.module.scss";
import { observer } from "mobx-react-lite";
import { FileText } from "lucide-react";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import AssistantChatMessageImage from "src/routes/Assistant/components/AssistantChatMessageImage";
import { filesManager } from "src/store/FilesManager.ts";
import { formatFileSize, isImageMimeType } from "src/helpers/fileMimeType.ts";

type FileProps = {
  file: ChatMessageFile;
};

const MessageFile: React.FC<FileProps> = observer(({ file }) => {
  const href = filesManager.cache[file.fileId] ?? undefined;

  React.useEffect(() => {
    filesManager.loadFileCacheInCache(file.fileId);
  }, [file.fileId]);

  return (
    <a className={style.file} href={href} download={file.name} target="_blank" rel="noreferrer" title={file.name}>
      <FileText className={style.icon} />
      <div className={style.info}>
        <div className={style.name}>{file.name}</div>
        <div className={style.size}>{formatFileSize(file.size)}</div>
      </div>
    </a>
  );
});

type Props = {
  assistantMessage: AssistantMessageController
};

const AssistantChatMessageFiles: React.FC<Props> = (props) => {
  const { assistantMessage } = props;
  const files = assistantMessage.message.files;

  if (!files?.length) return null;
  return (
    <div className={style.container}>
      {files.map(file => isImageMimeType(file.mimeType)
        ? <AssistantChatMessageImage key={file.fileId} imageId={file.fileId} />
        : <MessageFile key={file.fileId} file={file} />)}
    </div>
  );
};

export default observer(AssistantChatMessageFiles) as typeof AssistantChatMessageFiles;
