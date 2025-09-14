export interface DisposableItem {
  dispose: () => void;
}

export class DisposableContainer {
  items: Map<string | symbol, DisposableItem | null> = new Map();
  disposed = false;

  add<I extends DisposableItem | null>(item: I, key?: string | symbol): I {
    if (key) this.remove(key);

    this.items.set(key ?? Symbol(), item);
    return item;
  }

  remove(key: string | symbol) {
    const prevItem = this.items.get(key);
    prevItem?.dispose();
    this.items.delete(key);

    return null;
  }

  addReaction(dispose: () => void, key?: string) {
    return this.add({ dispose }, key);
  }

  dispose() {
    this.disposed = true;
    this.items.forEach((item) => {
      item?.dispose();
    });
  }
}
