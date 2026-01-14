import * as React from "react";
import style from "./BlockEditorLine.module.scss";
import { RenderElementProps } from "slate-react";

type Props = RenderElementProps;

const BlockEditorLine: React.FC<Props> = (props) => {
  return (
    <div {...props.attributes} className={style.line}>
      {props.children}
    </div>
  );
};

export default React.memo(BlockEditorLine) as typeof BlockEditorLine;
