import { flowsStorage, FlowStorageItem } from "src/storages/FlowsStorage.ts";
import { Flow } from "src/store/Flow.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";

export class FlowsManager extends AbstractManager<Flow, FlowStorageItem> {
  constructor() {
    super(flowsStorage, Flow);
  }

  getLabel(entity: Flow): string {
    return entity.name;
  }

  async importDefault() {
    await import("src/seeds/flows").then(({ default: flows }) => {
      flows.forEach((flow) => this.add(new Flow(flow, { isNew: true })));
    });
  }
}

export const flowsManager = new FlowsManager();
window.flowsManager = flowsManager;
