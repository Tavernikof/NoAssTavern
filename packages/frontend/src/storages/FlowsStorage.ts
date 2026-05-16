import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { Edge } from "@xyflow/react";
import { PromptCodeBlockStorageItem, PromptStorageItem } from "src/storages/PromptsStorage.ts";
import { MediaFile } from "src/storages/MediaFile.ts";
import { collectFlowMedia, deleteSnapshot } from "src/helpers/collectMediaIds.ts";

export type FlowSchemeNode<D = Record<string, any>> = {
  id: string,
  type?: string,
  position: { x: number, y: number },
  data: D,
}

export type FlowSchemeState = { nodes: FlowSchemeNode[], edges: Edge[] };

export type FlowExtraBlock = {
  id: string;
  key: string;
};

export type FlowStorageItem = {
  id: string,
  createdAt: Date,
  name: string,
  userPrefix: string,
  schemes: Record<string, FlowSchemeState>,
  extraBlocks: FlowExtraBlock[],
  prompts: PromptStorageItem[],
  codeBlocks: PromptCodeBlockStorageItem[],
  mediaFiles?: MediaFile[],
}

class FlowsStorage extends BaseStorage<FlowStorageItem> {
  slug = "flows";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async removeItem(id: string) {
    const flow = await this.getItem(id).catch(() => null);
    if (flow) await deleteSnapshot(collectFlowMedia(flow));
    await super.removeItem(id);
  }
}

export const flowsStorage = new FlowsStorage();
