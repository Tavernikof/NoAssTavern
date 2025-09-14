import { CharactersStorage } from "./storages/Characters.js";
import { ChatsStorage } from "./storages/Chats.js";
import { ConnectionProxiesStorage } from "./storages/ConnectionProxies.js";
import { FlowsStorage } from "./storages/Flows.js";
import { LoreBooksStorage } from "./storages/LoreBooks.js";
import { MessagesStorage } from "./storages/Messages.js";
import { PromptsStorage } from "./storages/Prompts.js";
import { RequestsStorage } from "./storages/Requests.js";
import { ImagesStorage } from "./storages/Images.js";
import { GlobalSettingsStorage } from "./storages/GlobalSettings.js";

export class StorageService {
  characters = new CharactersStorage(this);
  chats = new ChatsStorage(this);
  connectionProxies = new ConnectionProxiesStorage(this);
  flows = new FlowsStorage(this);
  globalSettings = new GlobalSettingsStorage(this);
  images = new ImagesStorage(this);
  loreBooks = new LoreBooksStorage(this);
  messages = new MessagesStorage(this);
  prompts = new PromptsStorage(this);
  requests = new RequestsStorage(this);

  list = [
    this.characters,
    this.chats,
    this.connectionProxies,
    this.flows,
    this.globalSettings,
    this.images,
    this.loreBooks,
    this.messages,
    this.prompts,
    this.requests,
  ];
}