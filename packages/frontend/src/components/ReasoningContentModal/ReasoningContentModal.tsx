import * as React from "react";
import { observer } from "mobx-react-lite";
import MarkdownRenderer from "src/components/MarkdownRenderer/MarkdownRenderer.tsx";

type Props = {
  message: ChatSwipePromptResult
};

const ReasoningContentModal: React.FC<Props> = (props) => {
  const { message: { reasoning } } = props;

  if (!reasoning) return "Reasoning not found";
  return (
    <MarkdownRenderer>{reasoning}</MarkdownRenderer>
  );
};

export default observer(ReasoningContentModal) as typeof ReasoningContentModal;
