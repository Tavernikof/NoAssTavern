import { action, makeObservable, observable } from "mobx";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { PresetEditor } from "src/components/BlockEditor/helpers/PresetEditor.ts";
import { Prompt } from "src/store/Prompt.ts";
import { PresetHistoryEditor } from "src/components/BlockEditor/helpers/PresetHistoryEditor.ts";
import { CodeBlocksEditorController } from "src/components/CodeBlocksEditor/helpers/CodeBlocksEditorController.ts";

export class PromptEditorController {
  prompt: Prompt;
  @observable.ref blocks: (PresetEditor | PresetHistoryEditor)[];
  @observable selectedTab: string;
  codeBlocksEditorController: CodeBlocksEditorController

  constructor(prompt: Prompt, initialCodeBlockId?: string) {
    this.prompt = prompt;
    this.blocks = prompt.blocks.map(block => {
      if (block.type === "history") return new PresetHistoryEditor(block);
      return new PresetEditor(block);
    });
    this.codeBlocksEditorController = new CodeBlocksEditorController(prompt.codeBlocks, initialCodeBlockId);
    this.selectedTab = initialCodeBlockId ? "code-blocks" : "prompt";

    makeObservable(this);
  }

  @action
  setSelectedTab(tab: string) {
    this.selectedTab = tab;
  }

  private moveElementInArray<E>(list: E[], element: E, down: boolean) {
    const index = list.indexOf(element);
    const nextIndex = index + (down ? 1 : -1);
    if (index === -1 || !list[nextIndex]) return list;
    const newList = [...list];
    newList[index] = newList[nextIndex];
    newList[nextIndex] = element;
    return newList;
  }

  // ==========================================================================

  getBlocksContent(): (PromptMessageBlock | PromptHistoryBlock)[] {
    return this.blocks.map(block => block.serialize());
  }

  @action
  private moveBlock(block: PresetEditor | PresetHistoryEditor, down: boolean) {
    this.blocks = this.moveElementInArray(this.blocks, block, down);
  }

  moveUpBlock(block: PresetEditor | PresetHistoryEditor) {
    this.moveBlock(block, false);
  }

  moveDownBlock(block: PresetEditor | PresetHistoryEditor) {
    this.moveBlock(block, true);
  }

  @action
  removeBlock(block: PresetEditor | PresetHistoryEditor) {
    this.blocks = this.blocks.filter(b => b !== block);
  }

  @action
  addBlock() {
    this.blocks = [
      ...this.blocks,
      new PresetEditor({
        type: "message",
        role: ChatMessageRole.USER,
        content: [{
          active: true,
          name: null,
          content: "",
        }],
      })];
  }

  @action
  addHistory() {
    this.blocks = [
      ...this.blocks,
      new PresetHistoryEditor({
        type: "history",
        from: null,
        to: null,
      })];
  }
}