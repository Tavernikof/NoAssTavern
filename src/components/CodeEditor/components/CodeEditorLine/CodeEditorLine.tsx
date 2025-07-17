import * as React from "react";
import style from "./CodeEditorLine.module.scss";
import { RenderElementProps } from "slate-react";

type Props = RenderElementProps;

const CodeEditorLine: React.FC<Props> = (props) => {
  return (
    <div {...props.attributes} className={style.line}>
      {props.children}
    </div>
  );
};

export default React.memo(CodeEditorLine) as typeof CodeEditorLine;
