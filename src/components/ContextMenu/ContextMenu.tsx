import * as React from "react";
import style from "./ContextMenu.module.scss";

export type ContextMenuOption = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  onClick: () => void;
}

type Props = {
  title?: React.ReactNode;
  options: ContextMenuOption[];
};

const ContextMenu: React.FC<Props> = (props) => {
  const { title, options } = props;

  return (
    <div className={style.container}>
      {title && <div className={style.title}>{title}</div>}
      <div className={style.options}>
        {options.map(option => (
          <button key={option.id} className={style.option} onClick={option.onClick}>
            <div className={style.label}>{option.label}</div>
            {option.description && <div className={style.description}>{option.description}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ContextMenu) as typeof ContextMenu;
