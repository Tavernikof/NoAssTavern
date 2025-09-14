import { LoreBook } from "src/store/LoreBook.ts";
import { loreBookStorage, LoreBookStorageItem } from "src/storages/LoreBookStorage.ts";
import { parseJsonFile } from "src/helpers/parseJsonFile.ts";
import { SillytavernLoreBookEntry, validateCharacterBook } from "src/helpers/validateCharacterCard.ts";
import _isPlainObject from "lodash/isPlainObject";
import { AbstractManager } from "src/helpers/AbstractManager.ts";

export class LoreBookManager extends AbstractManager<LoreBook, LoreBookStorageItem> {
  constructor() {
    super(loreBookStorage, LoreBook);
  }

  getLabel(entity: LoreBook): string {
    return entity.name;
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