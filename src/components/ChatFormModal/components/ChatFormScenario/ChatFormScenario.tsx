import * as React from "react";
import style from "./ChatFormScenario.module.scss";
import { useController } from "react-hook-form";
import { ChatFormFields } from "src/components/ChatFormModal/ChatFormModal.tsx";
import { FormInput, Textarea } from "src/components/Form";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChatFormContext } from "src/components/ChatFormModal/components/helpers/ChatFormContext.ts";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const ChatFormScenario: React.FC<Props> = () => {
  const { field: { value, onChange } } = useController<ChatFormFields, "scenario">({ name: "scenario" });
  const context = useChatFormContext();
  const { scenarios, scenario, selectedScenario, setSelectedScenario } = context;

  React.useEffect(() => {
    onChange(scenario);
  }, [scenario]);

  return (
    <FormInput label="Scenario:" name="scenario">
      <Textarea
        autoHeight
        value={value}
        onChange={(e) => {
          context.scenario = e.target.value;
        }}
      />
      {scenarios.length > 1 && (
        <div className={style.select}>
          <div className={style.action}>
            {context.selectedScenario > 0 && (
              <MessageActionButton onClick={() => setSelectedScenario(selectedScenario - 1)} icon={ChevronLeft} />
            )}
          </div>

          {selectedScenario + 1} / {scenarios.length}

          <div className={style.action}>
            {selectedScenario < scenarios.length - 1 && (
              <MessageActionButton onClick={() => setSelectedScenario(selectedScenario + 1)} icon={ChevronRight} />
            )}
          </div>
        </div>
      )}
    </FormInput>
  );
};

export default observer(ChatFormScenario) as typeof ChatFormScenario;
