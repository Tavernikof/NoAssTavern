import * as React from "react";

type Props = React.PropsWithChildren;

const AssistantLayout: React.FC<Props> = (props) => {
  const { children } = props;

  return children;
};

export default React.memo(AssistantLayout) as typeof AssistantLayout;
