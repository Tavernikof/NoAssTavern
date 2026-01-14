import { action, makeObservable, observable } from "mobx";
import { CodeBlock } from "src/store/CodeBlock.ts";
import { PromptCodeBlockStorageItem } from "src/storages/PromptsStorage.ts";

export class PresetEditorCodeBlock {
  @observable active: boolean;
  @observable name: string;
  @observable content: string;
  codeBlock: CodeBlock;

  constructor(promptCodeBlock: PromptCodeBlock) {
    this.active = promptCodeBlock.active;
    this.name = promptCodeBlock.codeBlock.name;
    this.content = promptCodeBlock.codeBlock.content;
    this.codeBlock = promptCodeBlock.codeBlock;

    makeObservable(this);
  }

  @action
  setActive(active: boolean) {
    this.active = active;
  }

  @action
  setName(name: string) {
    this.name = name;
  }

  @action
  setContent(content: string) {
    this.content = content;
  }

  serialize(): PromptCodeBlockStorageItem {
    return {
      active: this.active,
      codeBlock: {
        ...this.codeBlock.serialize(),
        name: this.name,
        content: this.content,
      },
    };
  }
}