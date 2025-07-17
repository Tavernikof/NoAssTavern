import * as React from "react";

type Props = React.PropsWithChildren;

const SingleChatLayout: React.FC<Props> = (props) => {
  const { children } = props;

  return children;
};

export default React.memo(SingleChatLayout) as typeof SingleChatLayout;
