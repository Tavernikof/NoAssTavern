import * as React from "react";
import style from "./FlowEditor.module.scss";
import { FormFields, FormInput, Input, InputControlled } from "src/components/Form";
import Button from "src/components/Button/Button.tsx";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { Pen, Plus, Trash } from "lucide-react";
import { openPromptEditorModal } from "src/components/PromptEditorModal";
import { defaultSchemesDict } from "src/enums/SchemeName.ts";
import Scheme from "src/components/FlowEditorModal/components/Scheme/Scheme.tsx";
import { useFlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const FlowEditor: React.FC<Props> = () => {
  const flowEditor = useFlowEditorContext();

  return (
    <div className={style.container}>
      <div className={style.sidebar}>
        <FormFields>
          <FormInput label="Name:" name="name">
            <InputControlled name="name" />
          </FormInput>

          <FormInput label="User prefix:" name="userPrefix">
            <InputControlled name="userPrefix" />
          </FormInput>
        </FormFields>

        {Boolean(flowEditor.prompts.length) && (
          <div className={style.prompts}>
            <div className={style.header}>Local prompts:</div>
            {flowEditor.prompts.map(prompt => (
              <div key={prompt.prompt.id} className={style.prompt}>
                <div className={style.promptName}>
                  {prompt.new ? "(new) " : ""}
                  {!prompt.used ? "(not used) " : ""}
                  {prompt.prompt.name}
                </div>
                {!prompt.used && (
                  <MessageActionButton
                    icon={Trash}
                    onClick={() => flowEditor.removePrompt(prompt.prompt.id)}
                  />
                )}
                <MessageActionButton
                  icon={Pen}
                  onClick={() => openPromptEditorModal({ prompt: prompt.prompt })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={style.editor}>
        {defaultSchemesDict.list.map(defaultScheme => {
          const schemeInfo = defaultSchemesDict.getById(defaultScheme.id);

          return (
            <div key={defaultScheme.id} className={style.block}>
              <div className={style.title}>
                {schemeInfo?.label}
                {schemeInfo ? <span className={style.note}>{schemeInfo.note}</span> : null}
              </div>
              <Scheme
                key={defaultScheme.id}
                schemeName={defaultScheme.id}
              />
            </div>
          );
        })}

        {flowEditor.extraBlocks.map(block => {
          return (
            <div key={block.id} className={style.block}>
              <div className={style.title}>
                <div className={style.input}>
                  <Input
                    placeholder="Block key"
                    defaultValue={block.key}
                    onBlur={(e) => flowEditor.updateExtraBlockName(block.id, e.target.value)}
                  />
                </div>
                <div className={style.note}>{block.id}</div>
                <div className={style.actions}>
                  <MessageActionButton
                    icon={Trash}
                    onClick={() => flowEditor.removeExtraBlock(block.id)}
                  />
                </div>
              </div>
              <Scheme
                schemeName={block.id}
              />
            </div>
          );
        })}

        <div>
          <Button
            iconBefore={Plus}
            type='button'
            onClick={() => flowEditor.addExtraBlock()}
          >
            Add extra block
          </Button>
        </div>
      </div>
    </div>
  );
};

export default observer(FlowEditor) as typeof FlowEditor;
