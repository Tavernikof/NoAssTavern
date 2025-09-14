import * as React from "react";
import style from "./Prompts.module.scss";
import Title from "src/components/Title";
import Button from "src/components/Button";
import { FolderPlus } from "lucide-react";
import PromptsList from "./components/PromptsList";
import { openPromptEditorModal } from "src/components/PromptEditorModal";
import { promptsManager } from "src/store/PromptsManager.ts";
import ImportButton from "src/components/ImportButton";
import { Prompt } from "src/store/Prompt.ts";
import { createPromptSeeds } from "src/helpers/seeds.ts";

type Props = Record<string, never>;

const Prompts: React.FC<Props> = () => {

  return (
    <div className={style.blocks}>
      <div>
        <Title>Prompt</Title>
        <div className={style.actions}>
          <Button
            iconBefore={FolderPlus}
            onClick={() => {
              openPromptEditorModal({ prompt: Prompt.createEmpty() }).result.then(prompt => {
                promptsManager.add(prompt);
              });
            }}
          >
            Create
          </Button>

          <ImportButton onUpload={promptsManager.import} text="Import from tavern" />

          <div className={style.aside}>
            <Button onClick={() => createPromptSeeds()}>Import default prompts</Button>
          </div>
        </div>
        <PromptsList />
      </div>
    </div>
  );
};

export default React.memo(Prompts) as typeof Prompts;
