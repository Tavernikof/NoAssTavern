import { FlowNode } from "src/enums/FlowNode.ts";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import * as React from "react";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout/FlowNodeLayout.tsx";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { CheckboxControlled } from "src/components/Form";

type FlowNodeNotifyState = {
  onlyInBackground: boolean;
}

export const flowNodeNotify: FlowNodeConfig<FlowNodeNotifyState> = {
  id: FlowNode.notify,
  label: "Notify",
  description: "Play notification sound",
  initialState: {
    onlyInBackground: true,
  },
  render: React.memo((props) => {
    return (
      <FlowNodeLayout initialValue={props.data}>
        <CheckboxControlled
          name="onlyInBackground"
          label={<>Play sound only when<br /> tab in background</>}
        />
        <DefaultFlowNodes />
      </FlowNodeLayout>
    );
  }),
  process({ node }) {
    if (node.data.onlyInBackground && globalSettings.pageActive) return;
    globalSettings.playNotificationAudio();
  },
};
