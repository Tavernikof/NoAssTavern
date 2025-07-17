import * as React from "react";
import { useModalContext } from "src/components/Modals";
import style from "./FlowEditorModal.module.scss";
import Form, { FormFields, FormInput, Input, InputControlled } from "src/components/Form";
import Button from "src/components/Button";
import { Flow } from "src/store/Flow.ts";
import ExtraInfoRow from "src/components/PromptEditorModal/components/ExtraInfoRow/ExtraInfoRow.tsx";
import { openPromptEditorModal } from "src/components/PromptEditorModal";
import { defaultSchemesDict } from "src/enums/SchemeName.ts";
import Scheme from "./components/Scheme";
import { FlowEditorState } from "src/components/FlowEditorModal/helpers/FlowEditorState.ts";
import { FlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { observer } from "mobx-react-lite";
import { Plus, Trash } from "lucide-react";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";

type FlowEditorDto = {
  name: string;
  userPrefix: string;
}

type Props = {
  flow: Flow
};

const FlowEditorModal: React.FC<Props> = (props) => {
  const { flow } = props;
  const { resolve } = useModalContext();
  const state = React.useMemo(() => new FlowEditorState(flow), [flow]);

  const onSave = (data: FlowEditorDto) => {
    console.log(data.userPrefix);
    flow.update({
      name: data.name,
      userPrefix: data.userPrefix,
      schemes: state.serializeState(),
      extraBlocks: state.extraBlocks,
    });
    resolve(flow);
  };

  return (
    <FlowEditorContext.Provider value={state}>
      <div className={style.container}>
        <div className={style.sidebar}>
          <div className={style.sticky}>
            <Form<FlowEditorDto>
              initialValue={{ name: flow.name, userPrefix: flow.userPrefix || "" }}
              onSubmit={onSave}
            >
              <FormFields>
                <FormInput label="Name:" name="name">
                  <InputControlled name="name" />
                </FormInput>

                <FormInput label="User prefix:" name="userPrefix">
                  <InputControlled name="userPrefix" />
                </FormInput>

                <Button block>Save</Button>
              </FormFields>
            </Form>
            {Boolean(state.usedPrompts.length) && (
              <div className={style.prompts}>
                <div className={style.header}>Used prompts:</div>
                {state.usedPrompts.map(prompt => (
                  <div key={prompt.id}>
                    <ExtraInfoRow
                      label={prompt.name}
                      onClick={() => openPromptEditorModal({ prompt })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
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

          {state.extraBlocks.map(block => {
            return (
              <div key={block.id} className={style.block}>
                <div className={style.title}>
                  <div className={style.input}>
                    <Input
                      placeholder="Block key"
                      defaultValue={block.key}
                      onBlur={(e) => state.updateExtraBlockName(block.id, e.target.value)}
                    />
                  </div>
                  <div className={style.note}>{block.id}</div>
                  <div className={style.actions}>
                    <MessageActionButton
                      icon={Trash}
                      onClick={() => state.removeExtraBlock(block.id)}
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
              onClick={() => state.addExtraBlock()}
            >
              Add extra block
            </Button>
          </div>
        </div>
      </div>
    </FlowEditorContext.Provider>
  );
};

export default observer(FlowEditorModal) as typeof FlowEditorModal;
