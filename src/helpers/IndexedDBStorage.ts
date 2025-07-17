import { IDBPCursorWithValue, IDBPDatabase, openDB } from "idb";

export abstract class IndexedDBStorage<I extends { id: string }> {
  abstract dbName: string;
  abstract storeName: string;
  abstract migrations: ((db: IDBPDatabase) => void)[];

  private dbPromise?: Promise<IDBPDatabase>;

  constructor() {
  }

  protected getDB() {
    if (!this.dbPromise) {
      const lastVersion = this.migrations.length;
      this.dbPromise = openDB(this.dbName, lastVersion, {
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

  // async addItem(value: I) {
  //   await (await this.getDB()).add(this.storeName, value);
  // }

  async updateItem(value: I) {
    await (await this.getDB()).put(this.storeName, value);
  }

  async removeItem(id: string) {
    return (await this.getDB()).delete(this.storeName, id);
  }

  protected async getStore() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    return tx.objectStore(this.storeName);
  }

  protected async extractCursorData(cursor: IDBPCursorWithValue | null): Promise<I[]> {
    const list = [];
    while (cursor) {
      list.push(cursor.value);
      cursor = await cursor.continue();
    }
    return list;
  }
}
