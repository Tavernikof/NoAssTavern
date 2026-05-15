import * as React from "react";
import { observer } from "mobx-react-lite";
import { Download, Plus, Trash } from "lucide-react";
import Button from "src/components/Button/Button.tsx";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { useFlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { filesManager } from "src/store/FilesManager.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import formatBytes from "src/components/FlowEditorModal/components/MediaGallery/helpers/formatBytes.ts";
import style from "./MediaGallery.module.scss";

type Props = Record<string, never>;

const MediaGallery: React.FC<Props> = () => {
  const flowEditor = useFlowEditorContext();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onPick = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      await flowEditor.addMediaFile(file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <Button
          iconBefore={Plus}
          type="button"
          disabled={busy}
          onClick={onPick}
        >
          {busy ? "Uploading..." : "Add file"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className={style.input}
          onChange={onFileChange}
        />
      </div>

      {flowEditor.mediaFiles.length === 0 && (
        <div className={style.empty}>No files yet</div>
      )}

      <div className={style.list}>
        {flowEditor.mediaFiles.map(file => (
          <MediaItem
            key={file.id}
            file={file}
            onRemove={() => flowEditor.removeMediaFile(file.id)}
          />
        ))}
      </div>
    </div>
  );
};

const MediaItem: React.FC<{
  file: import("src/storages/FlowsStorage.ts").FlowMediaFile,
  onRemove: () => void,
}> = observer(({ file, onRemove }) => {
  React.useEffect(() => {
    if (!globalSettings.isBackendEnabled) filesManager.getItem(file.id);
  }, [file.id]);

  const href = globalSettings.isBackendEnabled
    ? filesManager.getFileUrl(file.id)
    : filesManager.cache[file.id];

  return (
    <div className={style.item}>
      <div className={style.info}>
        <div className={style.name} title={file.name}>{file.name}</div>
        <div className={style.meta}>
          <span>{file.mimeType || "—"}</span>
          <span>{formatBytes(file.size)}</span>
        </div>
      </div>
      <div className={style.actions}>
        {href ? (
          <a
            href={href}
            download={file.name}
            target="_blank"
            rel="noreferrer"
            className={style.download}
          >
            <MessageActionButton icon={Download} />
          </a>
        ) : null}
        <MessageActionButton
          icon={Trash}
          onClick={onRemove}
        />
      </div>
    </div>
  );
});

export default observer(MediaGallery) as typeof MediaGallery;
