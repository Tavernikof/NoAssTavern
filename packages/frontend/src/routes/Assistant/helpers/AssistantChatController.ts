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
import { filesManager } from "src/store/FilesManager.ts";
import { ChatController } from "src/routes/SingleChat/helpers/ChatController.ts";
import {
  chatAssistantMessageStorage,
  ChatAssistantMessageStorageItem,
} from "src/storages/ChatAssistantMessageStorage.ts";
import { AssistantMessageStorageItem } from "src/storages/AssistantMessageStorage.ts";
import { prepareMessage } from "src/helpers/prepareMessage.ts";
import { CodeBlockFunction } from "src/enums/CodeBlockFunction.ts";
import { openAssistantCodeBlocksModal } from "src/routes/Assistant/components/AssistantCodeBlocksModal";
import type { PromptCodeBlockStorageItem } from "src/storages/PromptsStorage.ts";
import { isTextFile } from "src/helpers/fileMimeType.ts";

type CreateAssistantMessageConfig = {
  id?: string,
  assistantChatId?: string,
  date?: Date,
  messages?: string[],
  files?: ChatMessageFile[],
  role?: import("src/enums/ChatManagerRole.ts").ChatMessageRole
}

type AssistantChatControllerConfig = {
  parentChatController?: ChatController;
}

export type AssistantMessageData = AssistantMessageStorageItem & { chatId?: string };

export class AssistantChatController {
  private dc: DisposableContainer;

  @observable assistantChatId: string | null = null;
  @observable temp = false;

  @observable.ref messages: AssistantMessageController[] = [];
  messagesDict: Record<string, AssistantMessageController> = {};

  @observable.ref generationSettings: AssistantSettings | null = null;
  @observable.ref attachedFiles: File[] = [];

  private containerElement: HTMLDivElement | null = null;
  private pendingGenerations = new Set<AbortController>();
  readonly parentChatController?: ChatController;

  constructor(config?: AssistantChatControllerConfig) {
    this.parentChatController = config?.parentChatController;
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
    if (!this.assistantChatId) return null;
    if (this.parentChatController) {
      return this.parentChatController.chat.assistantChats.find(item => item.id === this.assistantChatId) ?? null;
    }
    return assistantChatsManager.dict[this.assistantChatId];
  }

  @computed
  get embedded() {
    return Boolean(this.parentChatController);
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
        this.getChatMessages(id).then(action(messages => {
          if (this.dc.disposed) return;
          if (id !== this.assistantChatId) return;

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

  @action
  addAttachedFiles(files: File[]) {
    if (!files.length) return;
    this.attachedFiles = [...this.attachedFiles, ...files];
  }

  @action
  removeAttachedFile(index: number) {
    this.attachedFiles = this.attachedFiles.filter((_, i) => i !== index);
  }

  @action
  clearAttachedFiles() {
    this.attachedFiles = [];
  }

  private async saveAttachedFiles(files: File[]): Promise<ChatMessageFile[]> {
    return Promise.all(files.map(async file => {
      const mimeType = file.type || "application/octet-stream";
      return {
        fileId: await filesManager.saveBlob(file, file.name, mimeType),
        name: file.name,
        mimeType,
        size: file.size,
      };
    }));
  }

  async submitMessage(message: string) {
    const attachedFiles = this.attachedFiles;
    if ((!message && !attachedFiles.length) || !this.generationSettings) return;
    this.clearAttachedFiles();
    const files = attachedFiles.length ? await this.saveAttachedFiles(attachedFiles) : undefined;
    const chatName = (message || attachedFiles[0]?.name || "").slice(0, 50);
    let assistantChatId = this.assistantChatId;
    const shouldCreateChat = !this.assistantChatId;

    if (shouldCreateChat) {
      assistantChatId = uuid();
      if (this.parentChatController) {
        await this.parentChatController.chat.addAssistantChat({
          id: assistantChatId,
          createdAt: new Date(),
          name: chatName,
        });
      } else {
        const assistantChat = new AssistantChat({
          id: assistantChatId,
          createdAt: new Date(),
          name: chatName,
          generationSettings: this.generationSettings,
        }, { isNew: true });

        await assistantChatsManager.add(assistantChat);
      }
    }

    if (!assistantChatId) return;
    await this.createMessage({
      messages: [message],
      files,
      assistantChatId,
      role: ChatMessageRole.USER,
    });

    await this.createAssistantMessage(assistantChatId);

    if (shouldCreateChat) {
      this.setChatId(assistantChatId, true);
      if (!this.embedded) await router.navigate(`/assistant/${assistantChatId}`);
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
      files,
      role = ChatMessageRole.ASSISTANT,
    } = config;
    if (!assistantChatId) return;
    const swipes = await Promise.all(messages.map(async (message, index) => ({
      createdAt: date,
      prompts: {
        [ChatSwipePrompt.message]: {
          message,
          ...(index === 0 && files?.length ? { files } : {}),
          preparedMessage: role === ChatMessageRole.USER && this.parentChatController
            ? await prepareMessage(message, this.parentChatController.getPresetVars())
            : undefined,
        },
      },
    })));
    const newMessage = new AssistantMessageController(this, {
      id: id,
      assistantChatId: assistantChatId,
      ...(this.parentChatController ? { chatId: this.parentChatController.chatId } : {}),
      createdAt: date,
      role,
      activeSwipe: 0,
      swipes,
    });

    runInAction(() => {
      if (!this.messages) return;
      this.messages = [...this.messages, newMessage];
      this.messagesDict[id] = newMessage;
    });
    await newMessage.forceSave();

    return newMessage;
  }

  async createAssistantMessage(assistantChatId = this.assistantChatId) {
    if (!assistantChatId) return;
    const assistantMessage = await this.createMessage({
      messages: [""],
      assistantChatId,
      role: ChatMessageRole.ASSISTANT,
    });
    if (assistantMessage) this.generateMessage(assistantMessage.id);
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
    let lastUpdateId = 0;

    const data: Omit<BackendProviderGenerateConfig<PromptGenerationConfig>, "messages"> = {
      baseUrl: connectionProxy?.baseUrl,
      key: connectionProxy?.key,
      model: model,
      generationConfig,
      onUpdate: async (data) => {
        const updateId = ++lastUpdateId;
        const result = await globalSettings.callAssistantCodeBlockFunction(CodeBlockFunction.onMessage, {
          message: data.message,
          finish: false,
        });
        runInAction(() => {
          const targetMessage = this.messagesDict[targetMessageId];
          if (!targetMessage?.pending || updateId !== lastUpdateId) return;
          targetMessage.message.message = result.message;
        });
      },
      onUpdateReasoning: action((data) => {
        const targetMessage = this.messagesDict[targetMessageId];
        targetMessage.message.reasoning += data.chunk;
      }),
      onPreRequest: (params) => globalSettings.callAssistantCodeBlockFunction(CodeBlockFunction.preRequest, {
        ...params,
        provider: backendProviderId,
      }),
      abortController: abortController,
    };

    const generation = this.buildPromptMessages(messages).then(
      (promptMessages) => {
        const config: BackendProviderGenerateConfig<PromptGenerationConfig> = { ...data, messages: promptMessages };
        return backendProvider.generate(config);
      },
      (e): BackendProviderGenerateResponse => ({
        message: "",
        reasoning: "",
        error: e instanceof Error ? e.message : String(e),
        inputTokens: 0,
        outputTokens: 0,
        url: "",
        request: {},
      }),
    );

    return generation.then(async response => {
      abortController.abort();
      let message = response.message;
      let error = response.error;
      try {
        message = (await globalSettings.callAssistantCodeBlockFunction(CodeBlockFunction.onMessage, {
          message,
          finish: true,
        })).message;
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
      const images = response.images
        ? await Promise.all(response.images.map(async image => ({ imageId: await filesManager.saveBase64(image.data, image.mimeType) })))
        : undefined;
      runInAction(() => {
        const targetMessage = this.messagesDict[targetMessageId];
        targetMessage.message.message = message;
        targetMessage.message.reasoning = response.reasoning;
        targetMessage.message.error = error;
        targetMessage.message.images = images;
        targetMessage.setPending(false);
      });
      this.pendingGenerations.delete(abortController);

      if (!globalSettings.pageActive) globalSettings.playNotificationAudio();
    });
  }

  private buildPromptMessages(messages: AssistantMessageController[]): Promise<PresetPrompt> {
    return Promise.all(messages.map(async (m): Promise<PresetPromptBlock> => {
      let content = m.message.preparedMessage ?? m.message.message;
      const files = m.message.files;
      if (!files?.length) return { role: m.role, content };

      const binaryFiles: PresetPromptFile[] = [];
      const textParts: string[] = [];
      for (const file of files) {
        if (isTextFile(file.mimeType, file.name)) {
          const text = await filesManager.getFileText(file.fileId);
          textParts.push(`<file name="${file.name}">\n${text}\n</file>`);
        } else {
          binaryFiles.push({
            name: file.name,
            mimeType: file.mimeType,
            data: await filesManager.getFileBase64(file.fileId),
          });
        }
      }
      if (textParts.length) content = [...textParts, content].filter(Boolean).join("\n\n");
      return {
        role: m.role,
        content,
        ...(binaryFiles.length ? { files: binaryFiles } : {}),
      };
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
    return this.removeStoredMessage(messageId);
  }

  @action
  deleteMessagesAfter(messageId: string) {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    while (this.messages[messageIndex]) {
      this.deleteMessage(this.messages[messageIndex].id);
    }
  }

  async removeCurrentChat() {
    if (!this.assistantChat) return Promise.reject();
    if (this.parentChatController && this.assistantChatId) {
      const assistantChatId = this.assistantChatId;
      await chatAssistantMessageStorage.removeAssistantChatItems(
        this.parentChatController.chatId,
        assistantChatId,
      );
      await this.parentChatController.chat.removeAssistantChat(assistantChatId);
      this.setChatId(null);
      return;
    }
    return assistantChatsManager.remove(this.assistantChat);
  }

  async prepareUserMessage(message: AssistantMessageController) {
    if (!this.parentChatController || message.role !== ChatMessageRole.USER) return;
    message.message.preparedMessage = await prepareMessage(
      message.message.message,
      this.parentChatController.getPresetVars(),
    );
  }

  saveMessage(message: AssistantMessageData) {
    if (this.parentChatController) {
      return chatAssistantMessageStorage.updateItem(message as ChatAssistantMessageStorageItem);
    }
    return assistantMessageStorage.updateItem(message);
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

  openCodeBlocks() {
    openAssistantCodeBlocksModal({ codeBlocks: globalSettings.assistantCodeBlocks }).result.then(
      (codeBlocks: PromptCodeBlockStorageItem[]) => globalSettings.updateAssistantCodeBlocks(codeBlocks),
      () => {},
    );
  }

  private getChatMessages(assistantChatId: string): Promise<AssistantMessageData[]> {
    if (this.parentChatController) {
      return chatAssistantMessageStorage.getChatItems(
        this.parentChatController.chatId,
        assistantChatId,
      );
    }
    return assistantMessageStorage.getChatItems(assistantChatId);
  }

  private removeStoredMessage(messageId: string) {
    if (this.parentChatController && this.assistantChatId) {
      return chatAssistantMessageStorage.removeItem(
        messageId,
        this.parentChatController.chatId,
        this.assistantChatId,
      );
    }
    return assistantMessageStorage.removeItem(messageId);
  }
}
