import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { LoreBookEntry, loreBookStorage, LoreBookStorageItem } from "src/storages/LoreBookStorage.ts";
import _cloneDeep from "lodash/cloneDeep";
import { v4 as uuid } from "uuid";
import { CharacterBook, SillytavernLoreBookEntry } from "src/helpers/validateCharacterCard.ts";
import { LoreBookStrategy } from "src/enums/LoreBookStrategy.ts";
import { Character } from "src/store/Character.ts";
import { escapeRegex, parseRegexFromString } from "src/helpers/parseRegexFromString.ts";

const DEFAULT_SCAN_DEPTH = 4;

type LoreBookCreateConfig = {
  isNew?: boolean;
  local?: boolean;
}

export class LoreBook {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable depth: number;
  @observable.ref entries: LoreBookEntry[];

  @observable isNew: boolean;
  local: boolean;

  constructor(data: LoreBookStorageItem, config?: LoreBookCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;

    this.update(data);

    makeObservable(this);

    if (!this.local) {
      reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
        if (isNew) return;
        loreBookStorage.updateItem(object);
      });
    }
  }

  static createEmpty(): LoreBook {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      depth: DEFAULT_SCAN_DEPTH,
      entries: [],
    }, { isNew: true });
  }

  static createFromCharacterBook(props: {
    characterBook: CharacterBook,
    file?: File,
    character?: Character,
    config?: LoreBookCreateConfig
  }): LoreBook {
    const { characterBook, file, character, config } = props;
    const { name, scan_depth, entries } = characterBook;

    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: name || file?.name || character?.name || "",
      depth: scan_depth || DEFAULT_SCAN_DEPTH,
      entries: entries.map(entry => ({
        id: uuid(),
        name: entry.name || "",
        active: entry.enabled,
        keywords: entry.keys,
        strategy: entry.constant ? LoreBookStrategy.constant : LoreBookStrategy.normal,
        position: "",
        depth: null,
        content: entry.content,
      })).filter(entry => entry.name || entry.content),
    }, config);
  }

  static createFromSillytavernLorebook(entries: Record<string, SillytavernLoreBookEntry>, file: File): LoreBook {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: file.name,
      depth: DEFAULT_SCAN_DEPTH,
      entries: Object.values(entries).map(entry => ({
        id: uuid(),
        name: entry.comment,
        active: !entry.disable,
        keywords: entry.key,
        strategy: entry.constant ? LoreBookStrategy.constant : entry.vectorized ? LoreBookStrategy.vectorized : LoreBookStrategy.normal,
        position: entry.position === 4 ? "in_chat" : "", // world_info_position.atDepth
        depth: entry.scanDepth,
        content: entry.content,
      })).filter(entry => entry.name || entry.content),
    });
  }

  @computed
  get parsedKeywords() {
    const parsedKeywords = new Map<string, { check: (messages: string) => boolean }>();
    this.entries.forEach(entry => {
      const { keywords } = entry;
      keywords.forEach(keyword => {
        if (!parsedKeywords.has(keyword)) {
          parsedKeywords.set(keyword, { check: this.parseKeyword(keyword) });
        }
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
    return new LoreBook(loreBookStorageItem, { isNew: true, local });
  }

  getActiveEntries(position: string, getMessages: ((depth: number) => string)): LoreBookEntry[] {
    const activeIndices = new Set<number>();

    const isPositionActive = (entry: LoreBookEntry) => {
      if (!entry.active) return false;
      if (entry.position !== position) return false;
      if (entry.strategy === LoreBookStrategy.constant) return true;
      if (entry.strategy === LoreBookStrategy.vectorized) return false;
      const messages = getMessages(entry.depth || this.depth).toLowerCase();
      return entry.keywords.some(keyword => {
        const parsedKeyword = this.parsedKeywords.get(keyword);
        return parsedKeyword ? parsedKeyword.check(messages) : false;
      });
    };

    this.entries.forEach((entry, index) => {
      if (isPositionActive(entry)) activeIndices.add(index);
    });

    let somethingAdded = false;
    do {
      somethingAdded = false;
      const texts = this.entries.reduce((texts, entry, index) => {
        if (activeIndices.has(index)) texts.push(entry.content);
        return texts;
      }, [] as string[]).join("\n\n").toLowerCase();

      this.entries.forEach((entry, index) => {
        if (activeIndices.has(index)) return;
        if (!entry.active) return;
        if (entry.position !== position) return;
        if (entry.strategy !== LoreBookStrategy.vectorized) return false;
        if (!entry.keywords.some(keyword => {
          const parsedKeyword = this.parsedKeywords.get(keyword);
          return parsedKeyword ? parsedKeyword.check(texts) : false;
        })) return;
        somethingAdded = true;
        activeIndices.add(index);
      });
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
}