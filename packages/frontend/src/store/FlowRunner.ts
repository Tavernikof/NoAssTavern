import { Flow } from "src/store/Flow.ts";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { MessageController } from "src/routes/SingleChat/helpers/MessageController.ts";
import { flowNodesDict } from "src/helpers/flowNodes";
import { FlowNode } from "src/enums/FlowNode.ts";
import { promisify } from "src/helpers/promisify.ts";
import { FlowSchemeNode, FlowSchemeState } from "src/storages/FlowsStorage.ts";

export class FlowRunner {
  @observable currentProcess: string[] = [];
  private abortController = new AbortController();

  constructor(
    private readonly flow: Flow,
    private readonly schemeName: string,
    private readonly messageController: MessageController,
  ) {
    makeObservable(this);
  }

  @computed
  get isProcess() {
    return Boolean(this.currentProcess?.length);
  }

  stop() {
    this.abortController.abort("cancelled");
  }

  @action
  process(): Promise<void> {
    const { flow, schemeName, messageController } = this;
    const scheme = flow.schemes[schemeName];
    if (!scheme) return Promise.reject(`Scheme "${schemeName}" not found`);

    const node = this.findStartNode(scheme);
    if (!node) return Promise.reject(`Start node in "${schemeName}" not found`);

    return this.processStep({
      flow,
      schemeName,
      messageController,
      scheme,
      node,
      abortController: this.abortController,
    });
  }

  private async processStep(context: FlowProcessContext) {
    const { scheme, node } = context;
    const processor = flowNodesDict[node.type as FlowNode];
    runInAction(() => this.currentProcess.push(node.id));
    await promisify(processor.process(context));
    runInAction(() => this.currentProcess.splice(this.currentProcess.findIndex(p => p === node.id), 1));

    const connections = scheme.edges.filter(edge => edge.source === node.id);
    await Promise.all(connections.map(connection => {
      const { target } = connection;
      const node = scheme.nodes.find(node => node.id === target);
      if (!node) return;
      return this.processStep({ ...context, node });
    }));
  }

  private findStartNode(scheme: FlowSchemeState): FlowSchemeNode | null {
    return scheme.nodes.find(node => node.type === FlowNode.start) ?? null;
  }
}