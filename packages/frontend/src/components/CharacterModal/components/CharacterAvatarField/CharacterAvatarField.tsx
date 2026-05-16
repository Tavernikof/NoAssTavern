import * as React from "react";
import style from "./CharacterAvatarField.module.scss";
import CharacterAvatar from "src/components/CharacterAvatar";
import { useController, useWatch } from "react-hook-form";
import { CharacterModalForm } from "../CharacterForm";
import { Upload, Trash } from "lucide-react";
import { filesManager } from "src/store/FilesManager.ts";

type Props = Record<string, never>;

const CharacterAvatarField: React.FC<Props> = () => {
  const { field: { value, onChange } } = useController<CharacterModalForm, "imageId">({ name: "imageId" });
  const name = useWatch<CharacterModalForm, "name">({ name: "name" });

  const onUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      filesManager.saveBlob(file, file.name, file.type).then(id => {
        onChange(id);
      });
    }
  };

  const onRemoveAvatar = () => {
    onChange(null);
  };

  return (
    <div className={style.container}>
      <CharacterAvatar imageId={value} name={name} />
      <div className={style.uploadOverlay}>
        <Upload className={style.icon} />
        {value && (
          <button className={style.removeButton} type="button" onClick={onRemoveAvatar}>
            <Trash className={style.icon} />
          </button>
        )}
      </div>
      <input className={style.upload} type="file" onChange={onUploadAvatar} accept="image/png, image/jpeg" />
    </div>
  );
};

export default React.memo(CharacterAvatarField) as typeof CharacterAvatarField;
