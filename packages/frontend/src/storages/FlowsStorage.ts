import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { Edge } from "@xyflow/react";
import { PromptStorageItem } from "src/storages/PromptsStorage.ts";

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
}

class FlowsStorage extends BaseStorage<FlowStorageItem> {
  slug = "flows";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];
}

export const flowsStorage = new FlowsStorage();
