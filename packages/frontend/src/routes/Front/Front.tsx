import * as React from "react";
import Title from "src/components/Title";

type Props = Record<string, never>;

const Front: React.FC<Props> = () => {
  return (
    <div className="markdown">
      <Title>Welcome to NoassTavern</Title>
      <p>Check <a href={env.DOCS_URL} target="_blank">the documentation</a> for quick start guide</p>
    </div>
  );
};

export default React.memo(Front) as typeof Front;
