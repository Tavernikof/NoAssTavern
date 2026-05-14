import * as React from "react";
import style from "./PromptForm.module.scss";
import { FormInput, InputControlled } from "src/components/Form";
import PresetEditForm from "src/components/PromptEditorModal/components/PresetEditForm/PresetEditForm.tsx";
import PromptBlockEditor from "../PromptBlockEditor";
import PromptEditorAddBlock from "../PromptEditorAddBlock";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { usePromptEditorControllerContext } from "../../helpers/PromptEditorControllerContext.ts";
import { PresetEditor } from "src/components/BlockEditor/helpers/PresetEditor.ts";
import { PresetHistoryEditor } from "src/components/BlockEditor/helpers/PresetHistoryEditor.ts";
import PromptHistoryBlockEditor from "src/components/PromptEditorModal/components/PromptHistoryBlockEditor";

type Props = Record<string, never>;

const PromptForm: React.FC<Props> = () => {
  const controller = usePromptEditorControllerContext();

  return (
    <>
      <div className={style.container}>
        <div className={clsx(style.column, style.aside)}>
          <FormInput label="Name:" name="name">
            <InputControlled name="name" />
          </FormInput>

          <hr className={style.separator} />

          <PresetEditForm />
        </div>
        <div className={clsx(style.column, style.main)}>
          {controller.blocks.map(block => {
            if (block instanceof PresetEditor) return <PromptBlockEditor key={block.id} editor={block} />;
            if (block instanceof PresetHistoryEditor) return <PromptHistoryBlockEditor key={block.id} editor={block} />;
            return null;
          })}
          <PromptEditorAddBlock />
        </div>
      </div>
    </>
  );
};

export default observer(PromptForm) as typeof PromptForm;
