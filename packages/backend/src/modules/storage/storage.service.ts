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
import { AssistantChatsStorage } from "./storages/AssistantChats.js";
import { AssistantMessagesStorage } from "./storages/AssistantMessages.js";
import { CodeBlocksStorage } from "./storages/CodeBlocks.js";

export class StorageService {
  assistantChats = new AssistantChatsStorage(this);
  assistantMessages = new AssistantMessagesStorage(this);
  characters = new CharactersStorage(this);
  chats = new ChatsStorage(this);
  codeBlocks = new CodeBlocksStorage(this);
  connectionProxies = new ConnectionProxiesStorage(this);
  flows = new FlowsStorage(this);
  globalSettings = new GlobalSettingsStorage(this);
  images = new ImagesStorage(this);
  loreBooks = new LoreBooksStorage(this);
  messages = new MessagesStorage(this);
  prompts = new PromptsStorage(this);
  requests = new RequestsStorage(this);

  list = [
    this.assistantChats,
    this.assistantMessages,
    this.characters,
    this.chats,
    this.codeBlocks,
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