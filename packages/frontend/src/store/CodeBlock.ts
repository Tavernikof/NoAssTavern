import { action, computed, makeObservable, observable, reaction } from "mobx";
import { codeBlocksStorage, CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";
import { v4 as uuid } from "uuid";
import _cloneDeep from "lodash/cloneDeep";
import { DisposableContainer, DisposableItem } from "src/helpers/DisposableContainer.ts";
import { CodeBlockFunction, CodeBlockFunctionArg } from "src/enums/CodeBlockFunction.ts";
import { filesManager } from "src/store/FilesManager.ts";
import type { Flow } from "src/store/Flow.ts";
import type { Prompt } from "src/store/Prompt.ts";
import type { CodeBlockCallOwner } from "src/store/CodeBlocksManager.ts";

type CodeBlockCreateConfig = {
  isNew?: boolean;
  local?: boolean;
  parentFlow?: Flow;
  parentPrompt?: Prompt;
}

export const CODE_BLOCK_FUNCTION_NOT_FOUND_ERROR = "function_not_found";
const DEFAULT_TIMEOUT = 5000;

type BridgeKind = "fileUrl" | "fileContent";

type PendingCall = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
};

type SerializedError = { message: string; stack?: string };

type SandboxMessage =
  | { type: "ready" }
  | { type: "result"; id: string; result?: unknown; error?: SerializedError }
  | { type: "bridge-request"; reqId: number; kind: BridgeKind; name: string };

function buildSandboxHtml(userContent: string): string {
  // User content is inlined directly so that top-level `function foo() {}` /
  // `var foo = ...` declarations attach to the iframe global as expected.
  // Callers are responsible for rejecting content that contains `</script`.
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function () {
  var pending = new Map();
  var cache = new Map();
  var seq = 0;
  function bridge(kind, name) {
    var key = kind + ":" + name;
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    var reqId = ++seq;
    return new Promise(function (resolve, reject) {
      pending.set(reqId, { resolve: resolve, reject: reject });
      parent.postMessage({ type: "bridge-request", reqId: reqId, kind: kind, name: name }, "*");
    }).then(function (value) { 
      cache.set(key, value);
      return value;
    });
  }
  self.getFileUrl = function (name) { return bridge("fileUrl", name); };
  self.getFileContent = function (name) { return bridge("fileContent", name); };

  self.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "bridge-response") {
      var h = pending.get(d.reqId);
      if (!h) return;
      pending.delete(d.reqId);
      if (d.error) h.reject(new Error(d.error)); else h.resolve(d.value);
      return;
    }
    if (d.type === "reset-cache") {
      cache.clear();
      return;
    }
    if (d.type === "call") {
      (async function () {
        if (typeof self[d.functionName] !== "function") {
          parent.postMessage({ type: "result", id: d.id, error: { message: ${JSON.stringify(CODE_BLOCK_FUNCTION_NOT_FOUND_ERROR)} } }, "*");
          return;
        }
        try {
          var r = await self[d.functionName](d.arg);
          parent.postMessage({ type: "result", id: d.id, result: r }, "*");
        } catch (err) {
          parent.postMessage({
            type: "result",
            id: d.id,
            error: { message: (err && err.message) || String(err), stack: err && err.stack },
          }, "*");
        }
      })();
    }
  });
})();
</script>
<script>
${userContent};
</script>
<script>
parent.postMessage({ type: "ready" }, "*");
</script></body></html>`;
}

export class CodeBlock implements DisposableItem {
  private dc = new DisposableContainer();
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable content: string;
  private parentFlow: Flow | null = null;
  private parentPrompt: Prompt | null = null;

  @observable isNew: boolean;
  local: boolean;

  private iframe: HTMLIFrameElement | null = null;
  private ready: Promise<void> | null = null;
  private messageHandler: ((e: MessageEvent) => void) | null = null;
  private pendingCalls = new Map<string, PendingCall>();
  currentFlow: Flow | null = null;
  currentPrompt: Prompt | null = null;

  constructor(data: CodeBlockStorageItem, config?: CodeBlockCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;
    this.parentFlow = config?.parentFlow ?? null;
    this.parentPrompt = config?.parentPrompt ?? null;
    this.update(data);
    makeObservable(this);

    if (!this.local) {
      this.dc.addReaction(reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
        if (isNew) return;
        codeBlocksStorage.updateItem(object);
      }));
    }
    this.dc.addReaction(reaction(() => this.content, () => {
      this.destroySandbox();
    }));

    setTimeout(() => {
      this.dc.addReaction(reaction(
        () => this.mediaGalleryList,
        () => {
          this.iframe?.contentWindow?.postMessage({ type: "reset-cache" }, "*");
        },
      ));
    }, 0);

    this.dc.addReaction(() => this.destroySandbox());
  }

  @computed
  get mediaGalleryList() {
    return this.parentFlow?.parentChat?.mediaGalleryList
      ?? this.parentPrompt?.parentFlow?.parentChat?.mediaGalleryList;
  }

  dispose() {
    this.dc.dispose();
  }

  static createEmpty(): CodeBlock {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      content: "",
    }, { isNew: true });
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
    return new CodeBlock(codeBlockStorageItem, { isNew: true, local });
  }

  serialize(): CodeBlockStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      content: this.content,
    };
  }

  private createSandbox(): Promise<void> {
    if (this.ready) return this.ready;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";
    iframe.src = `data:text/html;charset=utf-8,${encodeURIComponent(buildSandboxHtml(this.content))}`;

    this.ready = new Promise<void>((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) return;
        const data = event.data as SandboxMessage | undefined;
        if (!data || typeof data !== "object") return;

        if (data.type === "ready") {
          resolve();
          return;
        }

        if (data.type === "result") {
          const pending = this.pendingCalls.get(data.id);
          if (!pending) return;
          clearTimeout(pending.timeout);
          this.pendingCalls.delete(data.id);
          if (data.error) {
            const err = new Error(data.error.message);
            if (data.error.stack) err.stack = data.error.stack;
            pending.reject(err);
          } else {
            pending.resolve(data.result);
          }
          return;
        }

        if (data.type === "bridge-request") {
          this.handleBridgeRequest(iframe, data.reqId, data.kind, data.name);
          return;
        }
      };

      this.messageHandler = handler;
      window.addEventListener("message", handler);
    });

    this.iframe = iframe;
    document.body.appendChild(iframe);
    return this.ready;
  }

  private handleBridgeRequest(iframe: HTMLIFrameElement, reqId: number, kind: BridgeKind, name: string) {
    this.resolveBridge(kind, name).then(
      (value) => {
        iframe.contentWindow?.postMessage({ type: "bridge-response", reqId, value }, "*");
      },
      (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        iframe.contentWindow?.postMessage({ type: "bridge-response", reqId, error: message }, "*");
      },
    );
  }

  private destroySandbox() {
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
      this.messageHandler = null;
    }

    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.ready = null;
    for (const pending of this.pendingCalls.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error("Sandbox destroyed"));
    }
    this.pendingCalls.clear();
  }

  async callFunction<T extends CodeBlockFunction>(
    functionName: T,
    arg: CodeBlockFunctionArg<T>,
    owner?: CodeBlockCallOwner,
  ): Promise<CodeBlockFunctionArg<T>> {
    await this.createSandbox();
    const iframe = this.iframe;
    if (!iframe || !iframe.contentWindow) {
      throw new Error("Sandbox unavailable");
    }

    this.currentFlow = owner?.flow ?? null;
    this.currentPrompt = owner?.prompt ?? null;

    const id = uuid();
    return new Promise<CodeBlockFunctionArg<T>>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCalls.delete(id);
        reject(new Error(`Call timeout ${id} "${functionName}" in code block "${this.name}"`));
        this.destroySandbox();
      }, DEFAULT_TIMEOUT);

      this.pendingCalls.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      iframe.contentWindow!.postMessage({ type: "call", id, functionName, arg }, "*");
    });
  }

  async resolveBridge(kind: BridgeKind, name: string) {
    const file = this.mediaGalleryList?.find(({ file }) => file.name === name);
    if (!file) return Promise.resolve(null);
    const fileId = file.file.id;
    switch (kind) {
      case "fileUrl":
        return filesManager.getFileUrl(fileId);
      case "fileContent":
        return filesManager.getFileText(fileId);
    }
  }
}
