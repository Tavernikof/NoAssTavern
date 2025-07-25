import { action, makeObservable, observable } from "mobx";
import { flowsStorage } from "src/storages/FlowsStorage";
import { Flow } from "src/store/Flow";

class FlowsManager {
  @observable flows: string[] = [];
  @observable flowsDict: Record<string, Flow> = {};
  @observable ready = false;

  constructor() {
    makeObservable(this);

    flowsStorage.getItems().then(action((data) => {
      const list: string[] = [];
      const dict: Record<string, Flow> = {};
      data.forEach(item => {
        list.push(item.id);
        dict[item.id] = new Flow(item);
      });
      this.flows = list;
      this.flowsDict = dict;
      this.ready = true;
    }));
  }

  @action
  add(flow: Flow) {
    this.flows.unshift(flow.id);
    this.flowsDict[flow.id] = flow;
    flow.save();
  }

  @action
  remove(flow: Flow) {
    this.flows = this.flows.filter(flowId => flowId !== flow.id);
    delete this.flowsDict[flow.id];
    return flowsStorage.removeItem(flow.id);
  }
}

export const flowsManager = new FlowsManager();
window.flowManager = flowsManager;
