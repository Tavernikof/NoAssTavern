import { action, makeObservable, observable } from "mobx";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { PresetEditor } from "src/components/CodeEditor/helpers/PresetEditor.ts";
import { Prompt } from "src/store/Prompt.ts";

export class PresetEditorController {
  prompt: Prompt;
  @observable.ref blocks: PresetEditor[];

  constructor(prompt: Prompt) {
    this.prompt = prompt;
    this.blocks = prompt.blocks.map(block => new PresetEditor(block));

    makeObservable(this);
  }

  getContent(): PromptBlock[] {
    return this.blocks.map(block => block.serialize());
  }

  @action
  private moveBlock(block: PresetEditor, down: boolean) {
    const index = this.blocks.indexOf(block);
    const nextIndex = index + (down ? 1 : -1);
    if (index === -1 || !this.blocks[nextIndex]) return;
    const newList = [...this.blocks];
    newList[index] = newList[nextIndex];
    newList[nextIndex] = block;
    this.blocks = newList;
  }

  moveUpBlock(block: PresetEditor) {
    this.moveBlock(block, false);
  }

  moveDownBlock(block: PresetEditor) {
    this.moveBlock(block, true);
  }

  @action
  removeBlock(block: PresetEditor) {
    this.blocks = this.blocks.filter(b => b !== block);
  }

  @action
  addBlock() {
    this.blocks = [
      ...this.blocks,
      new PresetEditor({
      role: ChatMessageRole.USER,
      content: [{
        active: true,
        name: null,
        content: "",
      }],
    })];
  }
}