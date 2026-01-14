import { action, makeObservable, observable } from "mobx";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { PresetEditor } from "src/components/BlockEditor/helpers/PresetEditor.ts";
import { Prompt } from "src/store/Prompt.ts";
import { PresetEditorCodeBlock } from "src/components/PromptEditorModal/helpers/PresetEditorCodeBlock.ts";
import { CodeBlock } from "src/store/CodeBlock.ts";

export class PresetEditorController {
  prompt: Prompt;
  @observable.ref blocks: PresetEditor[];
  @observable.ref codeBlocks: PresetEditorCodeBlock[];
  @observable selectedCodeBlock: PresetEditorCodeBlock | null = null;
  @observable selectedTab: string;

  constructor(prompt: Prompt, initialCodeBlockId?: string) {
    this.prompt = prompt;
    this.blocks = prompt.blocks.map(block => new PresetEditor(block));
    this.codeBlocks = prompt.codeBlocks?.map(promptCodeBlock => new PresetEditorCodeBlock(promptCodeBlock)) || [];
    this.selectedCodeBlock = initialCodeBlockId ? this.codeBlocks.find(codeBlock => codeBlock.codeBlock.id === initialCodeBlockId) || null : null;
    this.selectedTab = this.selectedCodeBlock ? "code-blocks" : "prompt";

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

  getBlocksContent(): PromptBlock[] {
    return this.blocks.map(block => block.serialize());
  }

  @action
  private moveBlock(block: PresetEditor, down: boolean) {
    this.blocks = this.moveElementInArray(this.blocks, block, down);
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

  // ==========================================================================

  getCodeBlocksContent() {
    return this.codeBlocks.map(block => block.serialize());
  }

  @action
  private moveCodeBlock(codeBlock: PresetEditorCodeBlock, down: boolean) {
    this.codeBlocks = this.moveElementInArray(this.codeBlocks, codeBlock, down);
  }

  moveUpCodeBlock(codeBlock: PresetEditorCodeBlock) {
    this.moveCodeBlock(codeBlock, false);
  }

  moveDownCodeBlock(codeBlock: PresetEditorCodeBlock) {
    this.moveCodeBlock(codeBlock, true);
  }

  @action
  removeCodeBlock(codeBlock: PresetEditorCodeBlock) {
    this.codeBlocks = this.codeBlocks.filter(b => b !== codeBlock);
  }

  @action
  addCodeBlock() {
    this.codeBlocks = [
      new PresetEditorCodeBlock({
        active: true,
        codeBlock: CodeBlock.createEmpty(),
      }),
      ...this.codeBlocks,
    ];
  }

  cloneCodeBlock(codeBlock: CodeBlock) {
    this.codeBlocks = [
      new PresetEditorCodeBlock({
        active: true,
        codeBlock: codeBlock.clone(),
      }),
      ...this.codeBlocks,
    ]
  }

  @action
  selectCodeBlock(codeBlock: PresetEditorCodeBlock | null) {
    this.selectedCodeBlock = codeBlock;
  }
}