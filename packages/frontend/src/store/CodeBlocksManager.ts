import { AbstractManager } from "src/helpers/AbstractManager.ts";
import { CodeBlock } from "src/store/CodeBlock.ts";
import { codeBlocksStorage, CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";

export class CodeBlocksManager extends AbstractManager<CodeBlock, CodeBlockStorageItem> {
  constructor() {
    super(codeBlocksStorage, CodeBlock);
  }

  getLabel(entity: CodeBlock): string {
    return entity.name;
  }

  async importDefault() {
    await import("src/seeds/codeBlocks").then(({ default: codeBlocks }) => {
      codeBlocks.forEach((codeBlock) => this.add(new CodeBlock(codeBlock, { isNew: true })));
    });
  }
}

export const codeBlocksManager = new CodeBlocksManager();
window.codeBlocksManager = codeBlocksManager;