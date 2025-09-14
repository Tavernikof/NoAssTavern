import * as React from "react";
import style from "./ImportButton.module.scss";
import { Import } from "lucide-react";

type Props = {
  onUpload: (file: File) => void;
  text: React.ReactNode
};

const ImportButton: React.FC<Props> = (props) => {
  const { onUpload, text } = props;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      const [file] = files;
      onUpload(file);
    }
    e.currentTarget.value = "";
  };

  return (
    <div className={style.button}>
      <Import className={style.icon} />
      {text}
      <input
        className={style.input}
        type="file"
        onChange={onChange}
      />
    </div>
  );
};

export default React.memo(ImportButton) as typeof ImportButton;
