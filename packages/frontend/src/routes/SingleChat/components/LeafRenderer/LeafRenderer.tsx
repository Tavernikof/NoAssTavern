import * as React from "react";
import { RenderLeafProps } from "slate-react";
import { tokenClassNameMap } from "src/routes/SingleChat/helpers/parseText.ts";

type Props = RenderLeafProps;

const LeafRenderer = (props: Props): React.JSX.Element => {
  const { attributes, children, leaf } = props;
  const { token } = leaf;

  return (
    <span {...attributes} className={token ? tokenClassNameMap[token] : undefined}>{children}</span>
  );

};

export default React.memo(LeafRenderer) as typeof LeafRenderer;
