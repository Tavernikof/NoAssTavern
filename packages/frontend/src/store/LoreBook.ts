import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { LoreBookEntry, loreBookStorage, LoreBookStorageItem } from "src/storages/LoreBookStorage.ts";
import _cloneDeep from "lodash/cloneDeep";
import { v4 as uuid } from "uuid";
import { CharacterBook, SillytavernLoreBookEntry } from "src/helpers/validateCharacterCard.ts";
import { LoreBookStrategy } from "src/enums/LoreBookStrategy.ts";
import { Character } from "src/store/Character.ts";
import { escapeRegex, parseRegexFromString } from "src/helpers/parseRegexFromString.ts";
import { LoreBookConditionType } from "src/enums/LoreBookConditionType.ts";

const DEFAULT_SCAN_DEPTH = 4;

type LoreBookCreateConfig = {
  isNew?: boolean;
  local?: boolean;
  parentCharacter?: Character | null;
}

export class LoreBook {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable depth: number;
  @observable.ref entries: LoreBookEntry[];

  @observable isNew: boolean;
  local: boolean;
  parentCharacter: Character | null = null;

  constructor(data: LoreBookStorageItem, config?: LoreBookCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;
    this.parentCharacter = config?.parentCharacter ?? null;

    this.update(data);

    makeObservable(this);

    if (!this.local) {
      reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
        if (isNew) return;
        loreBookStorage.updateItem(object);
      });
    }

    requestAnimationFrame(() => this.migrate());
  }

  static createEmpty(parentCharacter?: Character): LoreBook {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      depth: DEFAULT_SCAN_DEPTH,
      entries: [],
    }, { isNew: true, parentCharacter });
  }

  static createFromCharacterBook(props: {
    characterBook: CharacterBook,
    file?: File,
    config?: LoreBookCreateConfig
  }): LoreBook {
    const { characterBook, file, config } = props;
    const character = config?.parentCharacter;
    const { name, scan_depth, entries } = characterBook;

    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: name || file?.name || character?.name || "",
      depth: scan_depth || DEFAULT_SCAN_DEPTH,
      entries: entries
        .sort(this.sortEntries)
        .map(entry => {
          return {
            id: uuid(),
            name: entry.name || entry.comment || "",
            active: entry.enabled,
            conditions: this.parseConditions(entry),
            strategy: entry.constant ? LoreBookStrategy.constant : entry.vectorized ? LoreBookStrategy.vectorized : LoreBookStrategy.normal,
            position: "",
            depth: null,
            content: entry.content,
          };
        })
        .filter(entry => entry.name || entry.content),
    }, config);
  }

  static createFromSillytavernLorebook(entries: Record<string, SillytavernLoreBookEntry>, file: File): LoreBook {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: file.name,
      depth: DEFAULT_SCAN_DEPTH,
      entries: Object.values(entries)
        .sort(this.sortEntries)
        .map(entry => ({
          id: uuid(),
          name: entry.comment,
          active: !entry.disable,
          conditions: this.parseConditions(entry),
          strategy: entry.constant ? LoreBookStrategy.constant : entry.vectorized ? LoreBookStrategy.vectorized : LoreBookStrategy.normal,
          position: entry.position === 4 ? "in_chat" : "", // world_info_position.atDepth
          depth: entry.scanDepth,
          content: entry.content,
        }))
        .filter(entry => entry.name || entry.content),
    });
  }

  @computed
  get parsedKeywords() {
    const parsedKeywords = new Map<string, { check: (messages: string) => boolean }>();
    this.entries.forEach(entry => {
      entry.conditions.forEach(condition => {
        const { keywords } = condition;
        keywords.forEach(keyword => {
          if (!parsedKeywords.has(keyword)) {
            parsedKeywords.set(keyword, { check: this.parseKeyword(keyword) });
          }
        });
      });
    });
    return parsedKeywords;
  }

  @action
  update(loreBookContent: Partial<LoreBookStorageItem>) {
    for (const field in loreBookContent) {
      const data = loreBookContent[field as keyof LoreBookStorageItem];
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
    }
  }

  @action
  save() {
    this.isNew = false;
  }

  @action
  clone(local?: boolean) {
    const loreBookStorageItem = _cloneDeep(this.serialize());
    loreBookStorageItem.id = uuid();
    loreBookStorageItem.createdAt = new Date();
    return new LoreBook(loreBookStorageItem, { isNew: true, local, parentCharacter: this.parentCharacter });
  }

  async getActiveEntries(position: string, getMessages: ((depth: number) => Promise<string>)): Promise<LoreBookEntry[]> {
    const activeIndices = new Set<number>();

    const isPositionActive = async (entry: LoreBookEntry, getText: () => string | Promise<string>, vectorized?: boolean) => {
      if (!entry.active) return false;
      if (entry.position !== position) return false;
      if (entry.strategy === LoreBookStrategy.constant) return true;
      if (vectorized) {
        if (entry.strategy !== LoreBookStrategy.vectorized) return false;
      } else {
        if (entry.strategy === LoreBookStrategy.vectorized) return false;
      }
      const text = await getText();

      return entry.conditions.every(condition => {
        const { type, keywords } = condition;
        switch (type) {
          case LoreBookConditionType.any:
            return keywords.some(keyword => {
              const parsedKeyword = this.parsedKeywords.get(keyword);
              return parsedKeyword ? parsedKeyword.check(text) : false;
            });

          case LoreBookConditionType.all:
            return keywords.every(keyword => {
              const parsedKeyword = this.parsedKeywords.get(keyword);
              return parsedKeyword ? parsedKeyword.check(text) : false;
            });

          case LoreBookConditionType.notAny:
            return !keywords.some(keyword => {
              const parsedKeyword = this.parsedKeywords.get(keyword);
              return parsedKeyword ? parsedKeyword.check(text) : false;
            });

          case LoreBookConditionType.notAll:
            return !keywords.every(keyword => {
              const parsedKeyword = this.parsedKeywords.get(keyword);
              return parsedKeyword ? parsedKeyword.check(text) : false;
            });
        }
      });
    };

    await Promise.all(this.entries.map(async (entry, index) => {
      if (await isPositionActive(entry, async () => (await getMessages(entry.depth || this.depth)).toLowerCase())) {
        activeIndices.add(index);
      }
    }));

    let somethingAdded = false;
    do {
      somethingAdded = false;
      const texts = this.entries.reduce((texts, entry, index) => {
        if (activeIndices.has(index)) texts.push(entry.content);
        return texts;
      }, [] as string[]).join("\n\n").toLowerCase();

      await Promise.all(this.entries.map(async (entry, index) => {
        if (activeIndices.has(index)) return;
        if (await isPositionActive(entry, () => texts, true)) {
          somethingAdded = true;
          activeIndices.add(index);
        }
      }));
    } while (somethingAdded);

    return this.entries.filter((_, index) => activeIndices.has(index));
  }

  private parseKeyword(keyword: string): ((messages: string) => boolean) {
    const keywordRegex = parseRegexFromString(keyword);
    if (keywordRegex) return (messages) => keywordRegex.test(messages);

    keyword = keyword.toLowerCase();

    const keywordWords = keyword.split(/\s+/);
    if (keywordWords.length > 1) return (messages) => messages.includes(keyword);

    const regex = new RegExp(`(?:^|\\W)(${escapeRegex(keyword)})(?:$|\\W)`);
    return (messages) => regex.test(messages);
  }

  serialize(): LoreBookStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      depth: this.depth,
      entries: toJS(this.entries),
    };
  }

  private migrate() {
    let needUpdate = false;
    this.entries.forEach(entry => {
      const keywords = (entry as unknown as { keywords?: string[] }).keywords as string[];
      if (keywords) {
        entry.conditions = [{ type: LoreBookConditionType.any, keywords }];
        needUpdate = true;
        delete (entry as unknown as { keywords?: string[] }).keywords;
      }
    });

    if (needUpdate) {
      this.entries = [...this.entries];
    }
  }

  private static parseConditions(entry: {
    extensions?: { selectiveLogic?: number },
    selectiveLogic?: number,
    key?: string[],
    keys?: string[],
    keysecondary?: string[],
    secondary_keys?: string[],
  }) {
    const conditions = [];
    if (entry.key) conditions.push({ type: LoreBookConditionType.any, keywords: entry.key });
    else if (entry.keys) conditions.push({ type: LoreBookConditionType.any, keywords: entry.keys });

    const sillyTavernLogic = {
      0: LoreBookConditionType.any,
      1: LoreBookConditionType.all,
      2: LoreBookConditionType.notAny,
      3: LoreBookConditionType.notAll,
    };
    const secondaryKeys = entry.secondary_keys ?? entry.keysecondary;
    if (secondaryKeys?.length) {
      const logic = entry.extensions?.selectiveLogic ?? entry.selectiveLogic;
      if (typeof logic === "number")
        conditions.push({
          type: sillyTavernLogic[logic as keyof typeof sillyTavernLogic],
          keywords: secondaryKeys,
        });
    }
    return conditions;
  }

  private static sortEntries<E extends { insertion_order?: number, order?: number }>(e1: E, e2: E) {
    let field1: number = 0;
    let field2: number = 0;
    if (typeof e1.insertion_order === "number" && typeof e2.insertion_order === "number") {
      field1 = e1.insertion_order;
      field2 = e2.insertion_order;
    } else if (typeof e1.order === "number" && typeof e2.order === "number") {
      field1 = e1.order;
      field2 = e2.order;
    }
    return field1 === field2 ? 0 : field1 > field2 ? 1 : -1;

  }
}