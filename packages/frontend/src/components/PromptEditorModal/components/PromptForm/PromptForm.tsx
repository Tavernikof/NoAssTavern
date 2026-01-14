import * as React from "react";
import style from "./PromptForm.module.scss";
import { FormInput, InputControlled } from "src/components/Form";
import PresetEditForm from "src/components/PromptEditorModal/components/PresetEditForm/PresetEditForm.tsx";
import PromptBlockEditor from "../PromptBlockEditor";
import PromptEditorAddBlock from "../PromptEditorAddBlock";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { usePresetEditorControllerContext } from "../../helpers/PresetEditorControllerContext.ts";

type Props = Record<string, never>;

const PromptForm: React.FC<Props> = () => {
  const controller = usePresetEditorControllerContext();

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
          {controller.blocks.map(block => (
            <PromptBlockEditor key={block.id} editor={block} />
          ))}
          <PromptEditorAddBlock />
        </div>
      </div>
    </>
  );
};

export default observer(PromptForm) as typeof PromptForm;
