import { CharactersStorage } from "./storages/Characters.js";
import { ChatsStorage } from "./storages/Chats.js";
import { ConnectionProxiesStorage } from "./storages/ConnectionProxies.js";
import { FlowsStorage } from "./storages/Flows.js";
import { LoreBooksStorage } from "./storages/LoreBooks.js";
import { MessagesStorage } from "./storages/Messages.js";
import { PromptsStorage } from "./storages/Prompts.js";
import { RequestsStorage } from "./storages/Requests.js";
import { FilesStorage } from "./storages/Files.js";
import { GlobalSettingsStorage } from "./storages/GlobalSettings.js";
import { AssistantChatsStorage } from "./storages/AssistantChats.js";
import { AssistantMessagesStorage } from "./storages/AssistantMessages.js";
import { CodeBlocksStorage } from "./storages/CodeBlocks.js";
import { GenerationPresetsStorage } from "./storages/GenerationPresets.js";

export class StorageService {
  assistantChats = new AssistantChatsStorage(this);
  assistantMessages = new AssistantMessagesStorage(this);
  characters = new CharactersStorage(this);
  chats = new ChatsStorage(this);
  codeBlocks = new CodeBlocksStorage(this);
  connectionProxies = new ConnectionProxiesStorage(this);
  files = new FilesStorage(this);
  flows = new FlowsStorage(this);
  generationPresets = new GenerationPresetsStorage(this);
  globalSettings = new GlobalSettingsStorage(this);
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
    this.files,
    this.flows,
    this.generationPresets,
    this.globalSettings,
    this.loreBooks,
    this.messages,
    this.prompts,
    this.requests,
  ];
}