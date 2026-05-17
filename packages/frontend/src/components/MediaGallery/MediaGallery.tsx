import * as React from "react";
import { observer } from "mobx-react-lite";
import { Plus } from "lucide-react";
import Button from "src/components/Button/Button.tsx";
import { MediaEditorController } from "src/components/MediaGallery/helpers/MediaEditorState.ts";
import style from "./MediaGallery.module.scss";
import MediaGalleryItem from "src/components/MediaGallery/components/MediaGalleryItem";

type Props = {
  controller: MediaEditorController;
};

const MediaGallery: React.FC<Props> = ({ controller }) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onPick = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      await controller.addMediaFile(file);
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

      {controller.mediaFiles.length === 0 && (
        <div className={style.empty}>No files yet</div>
      )}

      <div className={style.list}>
        {controller.mediaFiles.map(file => (
          <MediaGalleryItem
            key={file.id}
            file={file}
            onRemove={() => controller.removeMediaFile(file.id)}
            onRename={name => controller.renameMediaFile(file.id, name)}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(MediaGallery) as typeof MediaGallery;
