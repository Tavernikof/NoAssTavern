import { action, makeObservable, observable } from "mobx";
import { CodeBlock } from "src/store/CodeBlock.ts";
import { CodeBlockEditorBlockController } from "./CodeBlockEditorBlockController.ts";

export class CodeBlocksEditorController {
  @observable.ref codeBlocks: CodeBlockEditorBlockController[];
  @observable selectedCodeBlock: CodeBlockEditorBlockController | null = null;
  
  constructor(codeBlocks: PromptCodeBlock[], initialCodeBlockId?: string) {
    this.codeBlocks = codeBlocks?.map(promptCodeBlock => new CodeBlockEditorBlockController(promptCodeBlock)) || [];
    this.selectedCodeBlock = initialCodeBlockId ? this.codeBlocks.find(codeBlock => codeBlock.codeBlock.id === initialCodeBlockId) || null : null;

    makeObservable(this);
  }
  
  getCodeBlocksContent() {
    return this.codeBlocks.map(block => block.serialize());
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

  @action
  private moveCodeBlock(codeBlock: CodeBlockEditorBlockController, down: boolean) {
    this.codeBlocks = this.moveElementInArray(this.codeBlocks, codeBlock, down);
  }

  moveUpCodeBlock(codeBlock: CodeBlockEditorBlockController) {
    this.moveCodeBlock(codeBlock, false);
  }

  moveDownCodeBlock(codeBlock: CodeBlockEditorBlockController) {
    this.moveCodeBlock(codeBlock, true);
  }

  @action
  removeCodeBlock(codeBlock: CodeBlockEditorBlockController) {
    this.codeBlocks = this.codeBlocks.filter(b => b !== codeBlock);
  }

  @action
  addCodeBlock() {
    this.codeBlocks = [
      new CodeBlockEditorBlockController({
        active: true,
        codeBlock: CodeBlock.createEmpty(),
      }),
      ...this.codeBlocks,
    ];
  }

  @action
  cloneCodeBlock(codeBlock: CodeBlock) {
    this.codeBlocks = [
      new CodeBlockEditorBlockController({
        active: true,
        codeBlock: codeBlock.clone(),
      }),
      ...this.codeBlocks,
    ];
  }

  @action
  selectCodeBlock(codeBlock: CodeBlockEditorBlockController | null) {
    this.selectedCodeBlock = codeBlock;
  }
}