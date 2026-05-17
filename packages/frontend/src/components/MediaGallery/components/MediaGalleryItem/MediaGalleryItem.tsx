import * as React from "react";
import style from "./MediaGalleryItem.module.scss";
import { observer } from "mobx-react-lite";
import { filesManager } from "src/store/FilesManager.ts";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { Check, Download, Pencil, Trash } from "lucide-react";
import formatBytes from "src/components/MediaGallery/helpers/formatBytes.ts";

type Props = {
  file: MediaFile,
  onRemove: () => void,
  onRename: (name: string) => void,
};

const MediaGalleryItem: React.FC<Props> = ((props) => {
  const { file, onRemove, onRename } = props;

  React.useEffect(() => {
    filesManager.loadFileCacheInCache(file.id);
  }, [file.id]);

  const href = filesManager.cache[file.id];
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(file.name);

  const startEditing = () => {
    setDraft(file.name);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }
    onRename(trimmed);
    setEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className={style.item}>
      <div className={style.info}>
        {editing ? (
          <input
            className={style.nameInput}
            value={draft}
            autoFocus
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
        ) : (
          <div className={style.nameRow}>
            <div className={style.name} title={file.name}>{file.name}</div>
            <MessageActionButton icon={Pencil} onClick={startEditing} />
          </div>
        )}
        <div className={style.meta}>
          <span>{file.id}</span>
          <span>{file.mimeType || "—"}</span>
          <span>{formatBytes(file.size)}</span>
        </div>
      </div>
      <div className={style.actions}>
        {editing ? (
          <MessageActionButton icon={Check} onClick={save} />
        ) : null}
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

export default observer(MediaGalleryItem)