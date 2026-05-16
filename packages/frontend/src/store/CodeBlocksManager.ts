import { AbstractManager } from "src/helpers/AbstractManager.ts";
import { CODE_BLOCK_FUNCTION_NOT_FOUND_ERROR, CodeBlock } from "src/store/CodeBlock.ts";
import { codeBlocksStorage, CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";
import { CodeBlockFunction, CodeBlockFunctionArg } from "src/enums/CodeBlockFunction.ts";

export class CodeBlocksManager extends AbstractManager<CodeBlock, CodeBlockStorageItem> {
  private cache = new Map<string, { codeBlock: CodeBlock, refCount: number }>();

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

  syncPromptCodeBlocks(
    oldList: PromptCodeBlock[] | undefined,
    newList: PromptCodeBlock[] | undefined,
  ): PromptCodeBlock[] {
    const oldIds = new Set((oldList ?? []).map(item => item.codeBlock.id));
    const next = newList ?? [];
    const newIds = new Set(next.map(item => item.codeBlock.id));

    for (const oldId of oldIds) {
      if (newIds.has(oldId)) continue;
      const entry = this.cache.get(oldId);
      if (!entry) continue;
      entry.refCount--;
      if (entry.refCount <= 0) {
        entry.codeBlock.dispose();
        this.cache.delete(oldId);
      }
    }

    return next.map(promptCodeBlock => {
      const id = promptCodeBlock.codeBlock.id;
      let entry = this.cache.get(id);
      if (!entry) {
        const codeBlock = promptCodeBlock.codeBlock instanceof CodeBlock
          ? promptCodeBlock.codeBlock
          : new CodeBlock(promptCodeBlock.codeBlock, { local: true });
        entry = { codeBlock, refCount: 0 };
        this.cache.set(id, entry);
      } else if (!(promptCodeBlock.codeBlock instanceof CodeBlock)) {
        entry.codeBlock.update(promptCodeBlock.codeBlock);
      }
      if (!oldIds.has(id)) entry.refCount++;
      return { ...promptCodeBlock, codeBlock: entry.codeBlock };
    });
  }

  async callCodeBlockFunction<T extends CodeBlockFunction>(
    codeBlocks: PromptCodeBlock[],
    functionName: T,
    arg: CodeBlockFunctionArg<T>,
  ) {
    if (Array.isArray(codeBlocks)) {
      for (const codeBlock of codeBlocks) {
        if (!codeBlock.active) continue;
        try {
          arg = await codeBlock.codeBlock.callFunction(functionName, arg);
        } catch (e) {
          if (e instanceof Error && e.message === CODE_BLOCK_FUNCTION_NOT_FOUND_ERROR) {
            continue;
          } else {
            throw e;
          }
        }
      }
    }
    return arg;
  }
}

export const codeBlocksManager = new CodeBlocksManager();
window.codeBlocksManager = codeBlocksManager;