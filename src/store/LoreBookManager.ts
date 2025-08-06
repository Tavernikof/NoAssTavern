import { action, makeObservable, observable } from "mobx";
import { LoreBook } from "src/store/LoreBook.ts";
import { loreBookStorage } from "src/storages/LoreBookStorage.ts";
import { parseJsonFile } from "src/helpers/parseJsonFile.ts";
import { SillytavernLoreBookEntry, validateCharacterBook } from "src/helpers/validateCharacterCard.ts";
import _isPlainObject from "lodash/isPlainObject";

export class LoreBookManager {
  @observable loreBooks: string[] = [];
  @observable loreBooksDict: Record<string, LoreBook> = {};
  @observable ready = false;

  constructor() {
    makeObservable(this);

    loreBookStorage.getItems().then(action((data) => {
      const list: string[] = [];
      const dict: Record<string, LoreBook> = {};
      data.forEach(item => {
        list.push(item.id);

        dict[item.id] = new LoreBook(item);
      });
      this.loreBooks = list;
      this.loreBooksDict = dict;
      this.ready = true;
    }));
  }

  @action
  add(loreBook: LoreBook) {
    this.loreBooks.unshift(loreBook.id);
    this.loreBooksDict[loreBook.id] = loreBook;
    loreBook.save();
  }

  @action
  remove(loreBook: LoreBook) {
    this.loreBooks = this.loreBooks.filter(loreBookId => loreBookId !== loreBook.id);
    delete this.loreBooksDict[loreBook.id];
    loreBookStorage.removeItem(loreBook.id);
  }

  import = (file: File) => {
    parseJsonFile<{
      entries?: Record<string, SillytavernLoreBookEntry>,
      originalData?: Record<string, unknown>
    }>(file).then((data) => {
      const { entries, originalData } = data;
      try {
        if (entries && _isPlainObject(entries)) {
          const loreBook = LoreBook.createFromSillytavernLorebook(entries, file);
          this.add(loreBook);
          return;
        }
        if (originalData) {
          if (validateCharacterBook(originalData)) {
            const loreBook = LoreBook.createFromCharacterBook({ characterBook: originalData, file });
            this.add(loreBook);
            return;
          }
        }
        throw new Error("entries or originalData not found");
      } catch (e) {
        if (e instanceof Error) alert(e.message);
      }
    });
  };
}

export const loreBookManager = new LoreBookManager();
window.loreBookManager = loreBookManager;