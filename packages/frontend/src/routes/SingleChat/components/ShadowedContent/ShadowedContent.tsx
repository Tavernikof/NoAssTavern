import * as React from "react";
import style from "./ShadowedContent.module.scss";
import sharedCss from "../../ChatShared.module.scss?inline";

type Props = {
  content: string;
};

const ShadowedContent: React.FC<Props> = (props) => {
  const { content } = props;
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const shadowRoot = container.shadowRoot || container.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `<style>${sharedCss}</style>${content}`;
    }
  }, [content]);

  return (
    <div ref={containerRef} className={style.container} />
  );
};

export default React.memo(ShadowedContent) as typeof ShadowedContent;
