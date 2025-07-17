import * as React from "react";
import style from "./Scheme.module.scss";
import { Flow } from "src/store/Flow.ts";
import { observer } from "mobx-react-lite";
import { useFlowEditorContext } from "../../helpers/FlowEditorContext.ts";
import SchemeEditor from "src/components/SchemeEditor";

type Props = {
  schemeName: string;
};

const Scheme: React.FC<Props> = (props) => {
  const { schemeName } = props;
  const context = useFlowEditorContext();
  const { flow } = context;
  const scheme = React.useMemo(() => flow.schemes[schemeName] || Flow.createEmptySchemeState(), []);

  return (
    <div className={style.editor}>
      <SchemeEditor
        id={schemeName}
        initialState={scheme}
        onChange={(nodes, edges) => {
          context.setSchemeState(schemeName, { nodes, edges });
        }}
      />
    </div>
  );
};

export default observer(Scheme) as typeof Scheme;
