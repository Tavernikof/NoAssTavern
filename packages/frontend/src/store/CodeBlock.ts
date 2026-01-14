import { action, makeObservable, observable, reaction } from "mobx";
import { Character } from "src/store/Character.ts";
import { codeBlocksStorage, CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";
import { v4 as uuid } from "uuid";
import _cloneDeep from "lodash/cloneDeep";
import { DisposableContainer, DisposableItem } from "src/helpers/DisposableContainer.ts";
import { CodeBlockFunction, CodeBlockFunctionArg } from "src/enums/CodeBlockFunction.ts";

type CodeBlockCreateConfig = {
  isNew?: boolean;
  local?: boolean;
  parentCharacter?: Character | null;
}

export const CODE_BLOCK_FUNCTION_NOT_FOUND_ERROR = "function_not_found";
const DEFAULT_TIMEOUT = 5000;

export class CodeBlock implements DisposableItem {
  private dc = new DisposableContainer();
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable content: string;

  @observable isNew: boolean;
  local: boolean;
  parentCharacter: Character | null = null;

  private workerUrl: string | null = null;
  private worker: Worker | null = null;

  constructor(data: CodeBlockStorageItem, config?: CodeBlockCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;
    this.parentCharacter = config?.parentCharacter ?? null;
    this.update(data);
    makeObservable(this);

    if (!this.local) {
      this.dc.addReaction(reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
        if (isNew) return;
        codeBlocksStorage.updateItem(object);
      }));
    }

    this.dc.addReaction(reaction(() => this.content, () => {
      this.destroyWorker();
    }));

    this.dc.addReaction(() => this.destroyWorker());
  }

  dispose() {
    this.dc.dispose();
  }

  static createEmpty(parentCharacter?: Character): CodeBlock {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      content: "",
    }, { isNew: true, parentCharacter });
  }

  @action
  update(codeBlockContent: Partial<CodeBlockStorageItem>) {
    for (const field in codeBlockContent) {
      const data = codeBlockContent[field as keyof CodeBlockStorageItem];
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
    }
  }

  @action
  save() {
    this.isNew = false;
  }

  @action
  clone(local?: boolean) {
    const codeBlockStorageItem = _cloneDeep(this.serialize());
    codeBlockStorageItem.id = uuid();
    codeBlockStorageItem.createdAt = new Date();
    return new CodeBlock(codeBlockStorageItem, { isNew: true, local, parentCharacter: this.parentCharacter });
  }

  serialize(): CodeBlockStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      content: this.content,
    };
  }

  private createWorker() {
    if (!this.worker) {
      const workerCode = `
        Object.defineProperty(self, 'indexedDB', { value: undefined, writable: false, configurable: false });

        ${this.content}
        
        self.onmessage = async function(e) {
          const { id, functionName, arg } = e.data;
      
          if (typeof self[functionName] !== "function") {
            self.postMessage({ id, error: new Error("${CODE_BLOCK_FUNCTION_NOT_FOUND_ERROR}") });
            return;
          }
      
          try {
            const result = await self[functionName](arg);
            self.postMessage({ id, result });
          } catch (error) {
            self.postMessage({ id, error: error });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(this.workerUrl);
    }
    return this.worker;
  }

  private destroyWorker() {
    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  async callFunction<T extends CodeBlockFunction>(functionName: T, arg: CodeBlockFunctionArg<T>): Promise<CodeBlockFunctionArg<T>> {
    const worker = this.createWorker();

    return new Promise<CodeBlockFunctionArg<T>>((resolve, reject) => {
      const id = uuid();

      const timeout = setTimeout(() => {
        reject(new Error(`Call timeout ${id} "${functionName}" in code block "${this.name}"`));
        // probably worker hangs
        this.destroyWorker();
      }, DEFAULT_TIMEOUT);

      const messageHandler = (e: MessageEvent) => {
        if (e.data) {
          if (e.data.id !== id) return;

          clearTimeout(timeout);
          worker.removeEventListener("message", messageHandler);
          worker.removeEventListener("error", errorHandler);

          if ("result" in e.data) {
            resolve(e.data.result);
          } else {
            reject(e.data.error || new Error("Unknown worker error"));
          }
        }
      };

      const errorHandler = (err: ErrorEvent) => {
        clearTimeout(timeout);
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        reject(err || new Error("Worker error"));
      };

      worker.addEventListener("message", messageHandler);
      worker.addEventListener("error", errorHandler);

      worker.postMessage({ id, functionName, arg });
    });
  }
}