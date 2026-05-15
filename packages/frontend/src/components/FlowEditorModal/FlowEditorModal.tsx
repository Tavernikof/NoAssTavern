import * as React from "react";
import { Flow } from "src/store/Flow.ts";
import { FlowEditorController } from "src/components/FlowEditorModal/helpers/FlowEditorController.ts";
import { FlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { observer } from "mobx-react-lite";
import FlowEditor from "src/components/FlowEditorModal/components/FlowEditor";
import Tabs, { TabItem } from "src/components/Tabs/Tabs.tsx";
import style from "./FlowEditorModal.module.scss";
import CodeBlocksEditor, { CodeBlocksEditorCounter } from "src/components/CodeBlocksEditor";
import MediaGallery from "src/components/FlowEditorModal/components/MediaGallery";
import Button from "src/components/Button/Button.tsx";
import { useModalContext } from "src/components/Modals";
import Form from "src/components/Form";
import MediaGalleryCounter from "src/components/FlowEditorModal/components/MediaGalleryCounter";

export type FlowEditorDto = {
  name: string;
  userPrefix: string;
}

type Props = {
  flow: Flow,
  initialCodeBlockId?: string,
};

const FlowEditorModal: React.FC<Props> = (props) => {
  const { flow, initialCodeBlockId } = props;
  const { resolve } = useModalContext();

  const [controller, setController] = React.useState<FlowEditorController | null>(null);
  React.useEffect(() => {
    const state = new FlowEditorController(flow, initialCodeBlockId);
    setController(state);

    return () => {
      state.dispose();
      setController(null);
    };
  }, [flow, initialCodeBlockId]);

  const items = React.useMemo<TabItem[]>(() => ([
    {
      key: "flow",
      title: "Flow",
      content: () => <FlowEditor />,
    },
    {
      key: "code-blocks",
      title: controller ? <>Code blocks <CodeBlocksEditorCounter controller={controller.codeBlocksEditorController} /></> : null,
      content: () => controller ? <CodeBlocksEditor controller={controller.codeBlocksEditorController} /> : null,
    },
    {
      key: "media",
      title: <>Media <MediaGalleryCounter /></>,
      content: () => <MediaGallery />,
    },
  ]), [controller]);


  if (!controller) return null;
  return (
    <Form<FlowEditorDto>
      className={style.container}
      initialValue={{ name: flow.name, userPrefix: flow.userPrefix || "" }}
      onSubmit={async (data: FlowEditorDto) => {
        await controller.applyMediaChanges();
        flow.update({
          name: data.name,
          userPrefix: data.userPrefix,
          ...controller.serializeState(),
        });
        resolve(flow);
      }}
    >
      <FlowEditorContext.Provider value={controller}>
        <Tabs
          containerClassName={style.tabs}
          contentClassName={style.tabsContent}
          items={items}
          value={controller.selectedTab}
          onChange={(tab) => controller.setSelectedTab(tab)}
        />
        <div className={style.footer}>
          <div className={style.save}>
            <Button block>Save</Button>
          </div>
        </div>
      </FlowEditorContext.Provider>
    </Form>
  );
};

export default observer(FlowEditorModal) as typeof FlowEditorModal;
