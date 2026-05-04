import { v4 as uuid } from "uuid";
import { action, makeObservable } from "mobx";

export class PresetHistoryEditor {
  id = uuid();

  from: number | null = null;
  to: number | null = null;

  constructor(block: PromptHistoryBlock) {
    this.from = block.from;
    this.to = block.to;

    makeObservable(this);
  }

  @action
  setFrom(from: string) {
    this.from = from ? Number(from) : null
  }

  @action
  setTo(to: string) {
    this.to = to ? Number(to) : null
  }

  serialize(): PromptHistoryBlock {
    return {
      type: "history",
      from: this.from,
      to: this.to,
    };
  }
}