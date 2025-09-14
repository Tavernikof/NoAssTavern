import { IDBPCursorWithValue, IDBPDatabase, openDB } from "idb";

export class IndexedDBStorage<I extends { id: string }> {
  private dbPromise?: Promise<IDBPDatabase>;

  constructor(
    readonly slug: string,
    readonly migrations: ((db: IDBPDatabase) => void)[],
  ) {
  }

  protected getDB() {
    if (!this.dbPromise) {
      const lastVersion = this.migrations.length;
      this.dbPromise = openDB(this.slug, lastVersion, {
        upgrade: (db, oldVersion, newVersion) => {
          if (newVersion) {
            for (let version = oldVersion; version < newVersion; version++) {
              this.migrations[version]?.(db);
            }
          }
        },
      });
    }
    return this.dbPromise;
  }

  async getItems() {
    const store = await this.getStore();
    const index = store.index("createdAt");
    const cursor = await index.openCursor(null, "prev");
    return this.extractCursorData(cursor);
  }

  async getItem(id: string): Promise<I> {
    return await (await this.getDB()).get(this.slug, id);
  }

  async updateItem(value: I) {
    await (await this.getDB()).put(this.slug, value);
  }

  async removeItem(id: string) {
    return (await this.getDB()).delete(this.slug, id);
  }

  async getStore() {
    const db = await this.getDB();
    const tx = db.transaction(this.slug, "readonly");
    return tx.objectStore(this.slug);
  }

  async extractCursorData(cursor: IDBPCursorWithValue | null): Promise<I[]> {
    const list = [];
    while (cursor) {
      list.push(cursor.value);
      cursor = await cursor.continue();
    }
    return list;
  }
}
