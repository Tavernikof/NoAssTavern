import { AbstractManager } from "src/helpers/AbstractManager.ts";
import { CODE_BLOCK_FUNCTION_NOT_FOUND_ERROR, CodeBlock } from "src/store/CodeBlock.ts";
import { codeBlocksStorage, CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";
import { CodeBlockFunction, CodeBlockFunctionArg } from "src/enums/CodeBlockFunction.ts";

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