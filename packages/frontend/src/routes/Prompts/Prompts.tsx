import * as React from "react";
import style from "./Prompts.module.scss";
import Title from "src/components/Title";
import Button from "src/components/Button";
import { FolderPlus, GitBranchPlus, Plus, GitBranch, Folder, Code } from "lucide-react";
import PromptsList from "./components/PromptsList";
import { openPromptEditorModal } from "src/components/PromptEditorModal";
import { promptsManager } from "src/store/PromptsManager.ts";
import ImportButton from "src/components/ImportButton";
import { Prompt } from "src/store/Prompt.ts";
import CodeBlocksList from "src/routes/Prompts/components/CodeBlocksList";
import { openCodeBlockEditorModal } from "src/components/CodeBlockEditorModal";
import { CodeBlock } from "src/store/CodeBlock.ts";
import { codeBlocksManager } from "src/store/CodeBlocksManager.ts";
import { openFlowEditorModal } from "src/components/FlowEditorModal";
import { Flow } from "src/store/Flow.ts";
import { flowsManager } from "src/store/FlowsManager.ts";
import FlowsList from "src/routes/Prompts/components/FlowsList/FlowsList.tsx";

type Props = Record<string, never>;

const Prompts: React.FC<Props> = () => {

  return (
    <div className={style.blocks}>
      <div>
        <Title><GitBranch /> Flows</Title>
        <div className={style.actions}>
          <Button
            iconBefore={GitBranchPlus}
            onClick={() => {
              openFlowEditorModal({ flow: Flow.createEmpty() }).result.then(flow => {
                flowsManager.add(flow);
              });
            }}
          >
            Create
          </Button>

          <div className={style.aside}>
            <Button onClick={() => flowsManager.importDefault()}>Import default flow</Button>
          </div>
        </div>
        <FlowsList />
      </div>
      <div>
        <Title><Folder /> Prompts</Title>
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
            <Button onClick={() => promptsManager.importDefault()}>Import default prompts</Button>
          </div>
        </div>
        <PromptsList />
      </div>

      <div>
        <Title><Code /> Code Blocks</Title>
        <div className={style.actions}>
          <Button
            iconBefore={Plus}
            onClick={() => {
              openCodeBlockEditorModal({ codeBlock: CodeBlock.createEmpty() }).result.then(codeBlock => {
                codeBlocksManager.add(codeBlock);
              });
            }}
          >
            Create
          </Button>

          <div className={style.aside}>
            <Button onClick={() => codeBlocksManager.importDefault()}>Import default code blocks</Button>
          </div>
        </div>
        <CodeBlocksList />
      </div>
    </div>
  );
};

export default React.memo(Prompts) as typeof Prompts;
