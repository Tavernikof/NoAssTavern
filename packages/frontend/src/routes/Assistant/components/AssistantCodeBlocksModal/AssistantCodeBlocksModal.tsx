import * as React from "react";
import { useModalContext } from "src/components/Modals";
import style from "./AssistantCodeBlocksModal.module.scss";
import Form from "src/components/Form";
import Button from "src/components/Button";
import CodeBlocksEditor from "src/components/CodeBlocksEditor";
import { CodeBlocksEditorController } from "src/components/CodeBlocksEditor/helpers/CodeBlocksEditorController.ts";

type Props = {
  codeBlocks: PromptCodeBlock[],
};

const AssistantCodeBlocksModal: React.FC<Props> = (props) => {
  const { codeBlocks } = props;
  const { resolve } = useModalContext();
  const controller = React.useMemo(() => new CodeBlocksEditorController(codeBlocks, []), [codeBlocks]);

  return (
    <Form
      className={style.container}
      initialValue={{}}
      onSubmit={() => resolve(controller.getCodeBlocksContent())}
    >
      <div className={style.content}>
        <CodeBlocksEditor controller={controller} />
      </div>
      <div className={style.footer}>
        <div className={style.save}>
          <Button block>Save</Button>
        </div>
      </div>
    </Form>
  );
};

export default React.memo(AssistantCodeBlocksModal) as typeof AssistantCodeBlocksModal;
