export type EventEmitterCallback<ET extends EventTypes, E extends keyof ET> = (data: ET[E], eventName: E) => void;

export type EventEmitterListener = () => void;

export type EventEmitterEvents<ET extends EventTypes> = Partial<{
  [event in keyof ET]: Array<EventEmitterCallback<ET, event>>;
}>;

export type EventTypes = Record<string, any>

export default class EventEmitter<ET extends EventTypes> {
  events: EventEmitterEvents<ET> = {};

  on<E extends keyof ET>(event: E, callback: EventEmitterCallback<ET, E>): EventEmitterListener {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
    return () => {
      if (this.events[event]) {
        const index = this.events[event].indexOf(callback);
        this.events[event].splice(index, 1);
      }
    };
  };

  protected emit(event: keyof ET, data: ET[typeof event]): void {
    const events = this.events[event];
    if (!events) return;
    for (let i = 0; i < events.length; i++) {
      events[i](data, event);
    }
  }
}
