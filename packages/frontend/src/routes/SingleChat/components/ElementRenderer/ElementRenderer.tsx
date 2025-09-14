import * as React from "react";
import { RenderElementProps } from "slate-react";
import style from "src/routes/SingleChat/ChatShared.module.scss";
import clsx from "clsx";
import { useChatMessageContext } from "src/routes/SingleChat/helpers/ChatMessageContext.ts";

type Props = RenderElementProps;

const ElementRenderer = (props: Props): React.JSX.Element => {
  const { chatMessage } = useChatMessageContext();
  const decorator = chatMessage.editor?.decoratorsDict[props.element.id];

  return (
    <div
      {...props.attributes}
      className={clsx(
        style.paragraph,
        decorator?.error && style.paragraphError,
      )}
    >
      {props.children}
    </div>
  );
};

export default React.memo(ElementRenderer) as typeof ElementRenderer;
