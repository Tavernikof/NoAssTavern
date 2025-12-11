import { DisposableContainer } from "src/helpers/DisposableContainer.ts";
import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import { assistantMessageStorage } from "src/storages/AssistantMessageStorage.ts";
import { v4 as uuid } from "uuid";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import { router } from "src/components/App/helpers/router.tsx";
import { AssistantChat } from "src/store/AssistantChat.ts";
import { assistantChatsManager } from "src/store/AssistantChatsManager.ts";
import { openAssistantChatSettingsModal } from "src/routes/Assistant/components/AssistantChatSettingsModal";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";

type CreateAssistantMessageConfig = {
  id?: string,
  assistantChatId?: string,
  date?: Date,
  messages?: string[],
  role?: import("src/enums/ChatManagerRole.ts").ChatMessageRole
}

export class AssistantChatController {
  private dc: DisposableContainer;

  @observable assistantChatId: string | null = null;
  @observable temp = false;

  @observable.ref messages: AssistantMessageController[] = [];
  messagesDict: Record<string, AssistantMessageController> = {};

  @observable.ref generationSettings: AssistantSettings | null = null;

  private containerElement: HTMLDivElement | null = null;
  private pendingGenerations = new Set<AbortController>();

  constructor() {
    makeObservable(this);
  }

  setup() {
    this.dc = new DisposableContainer();

    this.dc.addReaction(reaction(() => globalSettings.defaultAssistantSettings, (defaultSettings) => {
      if (!defaultSettings) return;
      this.generationSettings = defaultSettings;
    }, { fireImmediately: true }));
  }

  dispose() {
    this.dc.dispose();
  }

  @computed
  get assistantChat() {
    return this.assistantChatId ? assistantChatsManager.dict[this.assistantChatId] : null;
  }

  @computed
  get someMessagePending() {
    return this.messages.some(m => m.pending);
  }

  @computed
  get firstMessage() {
    return this.messages?.[0];
  }

  @computed
  get lastMessage(): AssistantMessageController | undefined {
    const messages = this.messages;
    if (!messages) return undefined;
    return messages[messages.length - 1];
  }

  @computed
  get firstMessageId() {
    return this.firstMessage?.id;
  }

  @computed
  get lastMessageId() {
    return this.lastMessage?.id;
  }

  @action
  setChatId(id: string | null | undefined, skipLoading?: boolean) {
    if (!id) id = null;
    if (id === this.assistantChatId) return;
    this.assistantChatId = id;

    if (!skipLoading) {
      if (id) {
        assistantMessageStorage.getChatItems(id).then(action(messages => {
          if (this.dc.disposed) return;

          this.messagesDict = {};

          this.messages = messages.map(message => {
            const chatMessage = new AssistantMessageController(this, message);
            this.messagesDict[chatMessage.id] = chatMessage;
            return chatMessage;
          });
          this.scrollContainerToEnd();
        }));
      } else {
        this.messages = [];
      }
    }
  }

  async submitMessage(message: string) {
    if (!message || !this.generationSettings) return;
    let assistantChatId = this.assistantChatId;
    const shouldCreateChat = !this.assistantChatId;

    if (shouldCreateChat) {
      assistantChatId = uuid();
      const assistantChat = new AssistantChat({
        id: assistantChatId,
        createdAt: new Date(),
        name: message.slice(0, 50),
        generationSettings: this.generationSettings,
      }, { isNew: true });

      await assistantChatsManager.add(assistantChat);
    }

    if (!assistantChatId) return;
    await this.createMessage({
      messages: [message],
      assistantChatId,
      role: ChatMessageRole.USER,
    });


    const assistantMessage = await this.createMessage({
      messages: [""],
      assistantChatId,
      role: ChatMessageRole.ASSISTANT,
    });
    if (assistantMessage) this.generateMessage(assistantMessage.id);

    if (shouldCreateChat) {
      this.setChatId(assistantChatId, true);
      await router.navigate(`/assistant/${assistantChatId}`);
    } else {
      this.scrollContainerToEnd();
    }
  }

  async createMessage(config: CreateAssistantMessageConfig) {
    const {
      id = uuid(),
      assistantChatId = this.assistantChatId,
      date = new Date(),
      messages = [""],
      role = ChatMessageRole.ASSISTANT,
    } = config;
    if (!assistantChatId) return;
    const newMessage = new AssistantMessageController(this, {
      id: id,
      assistantChatId: assistantChatId,
      createdAt: date,
      role,
      activeSwipe: 0,
      swipes: messages.map(message => ({
        createdAt: date,
        prompts: {
          [ChatSwipePrompt.message]: { message },
        },
      })),
    });

    runInAction(() => {
      if (!this.messages) return;
      this.messages = [...this.messages, newMessage];
      this.messagesDict[id] = newMessage;
    });
    await newMessage.forceSave();

    return newMessage;
  }

  generateMessage(targetMessageId: string) {
    if (!this.generationSettings) return;
    const { backendProviderId, connectionProxyId, model, generationConfig } = this.generationSettings;
    if (!model) return;

    const backendProvider = backendProviderDict.getById(backendProviderId).class;
    if (!backendProvider) return;

    const connectionProxy = connectionProxyId
      ? connectionProxiesManager.dict[connectionProxyId]
      : undefined;

    const abortController = new AbortController();
    this.pendingGenerations.add(abortController);

    const targetMessageIndex = this.messages.findIndex(message => message.id === targetMessageId);
    if (targetMessageIndex === -1) return;
    const messages = this.messages.slice(0, targetMessageIndex);

    this.messagesDict[targetMessageId].setPending(true);

    const data: BackendProviderGenerateConfig<any> = {
      baseUrl: connectionProxy?.baseUrl,
      key: connectionProxy?.key,
      model: model,
      messages: messages.map(m => ({ role: m.role, content: m.message.message })),
      generationConfig,
      onUpdate: action((data) => {
        const targetMessage = this.messagesDict[targetMessageId];
        targetMessage.message.message += data.chunk;
      }),
      abortController: abortController,
    };

    return backendProvider.generate(data).then(action(response => {
      const targetMessage = this.messagesDict[targetMessageId];
      targetMessage.message.message = response.message;
      targetMessage.message.error = response.error;
      targetMessage.setPending(false);
      this.pendingGenerations.delete(abortController);

      if (!globalSettings.pageActive) globalSettings.playNotificationAudio();
    }));
  }

  cancelAllRequests() {
    this.pendingGenerations.forEach(abortController => abortController.abort("Cancel"));
  }

  @action
  deleteMessage(messageId: string) {
    if (!this.messages) return;
    delete this.messagesDict[messageId];
    this.messages = this.messages.filter(m => m.id !== messageId);
    return assistantMessageStorage.removeItem(messageId);
  }

  @action
  deleteMessagesAfter(messageId: string) {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    while (this.messages[messageIndex]) {
      this.deleteMessage(this.messages[messageIndex].id);
    }
  }

  removeCurrentChat() {
    if (!this.assistantChat) return Promise.reject();
    return assistantChatsManager.remove(this.assistantChat);
  }

  setContainer = (element: HTMLDivElement | null) => {
    this.containerElement = element;
  };

  scrollContainerToEnd() {
    requestAnimationFrame(() => {
      const el = this.containerElement;
      if (el) el.scrollTop = 9999999;
    });
  }

  openSettings() {
    if (!this.generationSettings) return;
    openAssistantChatSettingsModal(this.generationSettings).result.then(
      action((data) => {
        globalSettings.updateDefaultAssistantSettings(data);
      }),
      () => {},
    );
  }
}