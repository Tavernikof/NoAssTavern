import { action, autorun, computed, makeObservable, observable, runInAction, toJS } from "mobx";
import { v4 as uuid } from "uuid";
import { MessageController } from "./MessageController.ts";
import { messageStorage } from "src/storages/MessageStorage.ts";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { chatsManager } from "src/store/ChatsManager.ts";
import { sliceFromEnd } from "src/routes/SingleChat/helpers/slideFromEnd.ts";
import randomInt from "src/helpers/randomInt.ts";
import {
  prepareCharFields,
  prepareImpersonate,
  prepareMessage,
  preparePersonaFields,
} from "src/helpers/prepareMessage.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { DisposableContainer } from "src/helpers/DisposableContainer.ts";
import { ChatVariablesController } from "src/routes/SingleChat/helpers/ChatVariablesController.ts";
import { CodeBlockFunction } from "src/enums/CodeBlockFunction.ts";

export class ChatController {
  private dc = new DisposableContainer();

  chatId: string;
  @observable.ref messages: MessageController[] | undefined;
  messagesDict: Record<string, MessageController> = {};
  variables: ChatVariablesController;
  @observable private messagesLoaded = false;

  constructor(chatId: string) {
    this.chatId = chatId;
    makeObservable(this);

    this.variables = this.dc.add(new ChatVariablesController(this));

    messageStorage.getChatItems(this.chatId).then(async messages => {
      if (this.dc.disposed) return;

      runInAction(() => {
        this.messagesDict = {};
        this.messages = messages.map(message => {
          const chatMessage = new MessageController(this, message);
          this.messagesDict[chatMessage.id] = chatMessage;
          return chatMessage;
        });
      });

      if (!messages.length) {
        const greetings: string[] = [];
        this.characters.forEach(({ character }, index) => {
          character.greetings.forEach(message => {
            greetings.push(prepareCharFields(message, index));
          });
        });
        if (!greetings.length) greetings.push("");
        await this.createMessage({
          messages: greetings,
          date: new Date(),
        });
      }

      setTimeout(() => {
        runInAction(() => this.messagesLoaded = true);
        const messages = this.messages;
        if (!messages) return;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) lastMessage.focusEditor();
      });
    });

    this.dc.addReaction(autorun(() => {
      if (!this.messages || !this.messagesLoaded) return;
      if (this.flow.isProcess) return;
      if (!this.lastMessage || this.lastMessage.role !== ChatMessageRole.USER) {
        this.createEmptyUserMessage(new Date(+(new Date()) + 1));
      }
    }));
  }

  dispose() {
    this.dc.dispose();
  }

  @computed
  get chat() {
    return chatsManager.dict[this.chatId];
  }

  @computed
  get characters() {
    return this.chat.characters;
  }

  @computed
  get persona() {
    return this.characters.find(c => c.character.id === this.chat.persona);
  }

  @computed
  get personaId() {
    return this.persona?.character?.id;
  }

  @computed
  get flow() {
    return this.chat.flow;
  }

  @computed
  get firstMessage(): MessageController | undefined {
    const firstMessage = this.messages?.[0];
    return firstMessage instanceof MessageController ? firstMessage : undefined;
  }

  @computed
  get lastMessage(): MessageController | undefined {
    const messages = this.messages;
    if (!messages) return undefined;
    const lastMessage = messages[messages.length - 1];
    return lastMessage instanceof MessageController ? lastMessage : undefined;
  }

  @computed
  get firstMessageId() {
    return this.firstMessage?.id;
  }

  @computed
  get lastMessageId() {
    return this.lastMessage?.id;
  }

  @computed
  get loreBooks() {
    const loreBooks: ChatLoreBook[] = [];

    this.characters.forEach((item) => {
      if (!item.active || !item.character.loreBook) return;
      loreBooks.push({ loreBook: item.character.loreBook, active: true });
    });

    loreBooks.push(...this.chat.loreBooks);

    return loreBooks;
  }


  getUserPrefix() {
    return prepareMessage(prepareImpersonate(this.flow.userPrefix), this.getPresetVars());
  }

  @action
  deleteMessage(messageId: string) {
    if (!this.messages) return;
    delete this.messagesDict[messageId];
    this.messages = this.messages.filter(m => m.id !== messageId);
    return messageStorage.removeItem(messageId);
  }

  @action
  deleteMessagesAfter(messageId: string) {
    const messageIndex = this.getMessageIndex(messageId);
    if (!this.messages || typeof messageIndex !== "number") return;
    while (this.messages[messageIndex]) {
      this.deleteMessage(this.messages[messageIndex].id);
    }
  }

  @action
  processRequest(schemeName: string, messageController: MessageController) {
    return this.flow.process(schemeName, messageController);
  }

  async createEmptyUserMessage(date?: Date) {
    return this.createMessage({
      messages: [prepareImpersonate(this.flow.userPrefix)],
      role: ChatMessageRole.USER,
      date: date ?? new Date(),
    });
  }

  getPresetVars(config?: GetPresetVarsConfig, context?: GetPresetVarsContext): PresetVars {
    if (!context) context = { vars: this.variables.createLocalVariablesContainer() };
    const fromMessage = config?.fromMessage ?? this.firstMessage;
    const toMessage = config?.toMessage ?? this.lastMessage;
    let fromMessageIndex = this.getMessageIndex(fromMessage?.id);
    let toMessageIndex = this.getMessageIndex(toMessage?.id);
    if (typeof fromMessageIndex === "number" && typeof toMessageIndex === "number" && fromMessageIndex > toMessageIndex) {
      const buffer = toMessageIndex;
      toMessageIndex = fromMessageIndex;
      fromMessageIndex = buffer;
    }

    return {
      user: () => preparePersonaFields(this.persona?.character.name || ""),
      persona: () => preparePersonaFields(this.persona?.character.description || ""),
      impersonate: () => this.chat.impersonate || "{{user}}",

      // {{char:1}} - имя первого персонажа
      char: (rawArgument) => {
        rawArgument = rawArgument.replace(/\D/g, "");
        if (rawArgument && !Number.isNaN(+rawArgument)) {
          const index = +rawArgument - 1;
          const character = this.characters[index];
          if (character) return prepareCharFields(character.character.name.trim(), index);
        }
        return this.characters
          .map(({ character, active }, index) => {
            return active && character.id !== this.personaId ? prepareCharFields(character.name.trim(), index) : "";
          })
          .filter(Boolean)
          .join(", ");
      },
      description: (rawArgument) => {
        rawArgument = rawArgument.replace(/\D/g, "");
        if (rawArgument && !Number.isNaN(+rawArgument)) {
          const index = +rawArgument - 1;
          const character = this.characters[index];
          if (character) return prepareCharFields(character.character.description.trim(), index);
        }
        return this.characters
          .map(({ character, active }, index) => {
            return active && character.id !== this.personaId ? prepareCharFields(character.description.trim(), index) : "";
          })
          .filter(Boolean)
          .join("\n\n");
      },

      scenario: () => this.chat.scenario || "",

      // Сообщения в порядке возрастания даты. Старые - первые
      // {{history}} - все сообщения
      // {{history:1:10}} - последние 10 сообщений с конца
      // {{history::10}} - последние 10 сообщений с конца
      // {{history:11}} - все сообщения начиная с 11 с конца
      // {{history:7:10}} - последние 3 сообщения начиная с 7
      history: async (rawArgument) => {
        let messages = (this.messages ?? []).map(m => toJS(m.currentSwipe));

        if (typeof toMessageIndex === "number") messages = messages.slice(0, toMessageIndex + 1);
        if (typeof fromMessageIndex === "number") messages = messages.slice(fromMessageIndex);

        if (config?.prompt) {
          const result = await config.prompt.callCodeBlockFunction(CodeBlockFunction.preHistory, { messages });
          messages = result.messages;
        }

        const [from, to] = rawArgument.split(":").filter(Boolean);
        const prepareIndex = (indexStr: string) => {
          let index: number | null = +indexStr;
          index = Number.isNaN(index) ? null : index;
          if (typeof index === "number" && index < 1) index = 1;
          return index;
        };
        const fromIndex = prepareIndex(from);
        const toIndex = prepareIndex(to);
        messages = sliceFromEnd(messages, fromIndex, toIndex);

        return messages
          .map(m => (m.prompts[ChatSwipePrompt.message]?.message || "").trim())
          .filter(Boolean)
          .join("\n\n");
      },

      external: (rawArgument) => { // {{external:currentInfo}}
        if (!this.messages || typeof toMessageIndex !== "number") return "";

        const extraBlockKey = rawArgument.slice(1);

        for (let i = toMessageIndex; i >= 0; i--) {
          const message = this.messages[i];
          const block = message.currentSwipe.prompts[extraBlockKey];
          const blockMessage = block?.message.trim();
          if (blockMessage) return blockMessage;
        }
        return "";
      },

      lastUserMessage: () => {
        if (!this.messages || typeof toMessageIndex !== "number") return "";
        for (let i = toMessageIndex; i >= 0; i--) {
          const message = this.messages[i];
          if (message instanceof MessageController && message.role === ChatMessageRole.USER) {
            return message.message.message.trim();
          }
        }
        return "";
      },

      random: (rawArgument) => { // {{random::value 1::value 2}}
        if (!rawArgument) return "";

        const list = rawArgument.includes("::")
          ? rawArgument.split("::").slice(1)
          // Replaced escaped commas with a placeholder to avoid splitting on them
          : rawArgument.replace(/\\,/g, "##�COMMA�##").split(",").map(item => item.trim().replace(/##�COMMA�##/g, ","));

        if (list.length === 0) {
          return "";
        }
        const randomIndex = randomInt(0, list.length - 1);
        return list[randomIndex];
      },

      newline: () => "\n",

      // {{lorebook}}
      // {{lorebook:in_chat}}
      lorebook: async (rawArgument) => {
        const position = rawArgument.split(":").filter(Boolean)[0] || "";
        const result: string[] = [];

        const vars = this.getPresetVars({ fromMessage, toMessage }, context);
        const getMessages = (depth: number) => vars.history(`1:${depth}`) as Promise<string>;

        for (const { loreBook, active } of this.loreBooks) {
          if (!active) continue;
          const entries = await loreBook.getActiveEntries(position, getMessages);
          entries.forEach(entry => {
            result.push(entry.content);
          });
        }

        return result.join("\n");
      },

      // {{setvar::name::value}}
      setvar: (rawArgument) => {
        const [, name, value] = rawArgument.split("::");
        context.vars.setVar(name, value);
        return "";
      },
      // {{addvar::name::value}}
      addvar: (rawArgument) => {
        const [, name, value] = rawArgument.split("::");
        context.vars.setVar(name, value);
        return "";
      },
      // {{incvar::name}}
      incvar: (rawArgument) => {
        const [, name] = rawArgument.split("::");
        context.vars.incVar(name);
        return "";
      },
      // {{decvar::name}}
      decvar: (rawArgument) => {
        const [, name] = rawArgument.split("::");
        context.vars.decVar(name);
        return "";
      },
      // {{getvar::name}}
      getvar: (rawArgument) => {
        const [, name] = rawArgument.split("::");
        return context.vars.getVar(name);
      },

      // {{setglobalvar::name::value}}
      setglobalvar: (rawArgument) => {
        const [, name, value] = rawArgument.split("::");
        this.variables.setVar(name, value);
        return "";
      },
      // {{addglobalvar::name::value}}
      addglobalvar: (rawArgument) => {
        const [, name, value] = rawArgument.split("::");
        this.variables.setVar(name, value);
        return "";
      },
      // {{incglobalvar::name}}
      incglobalvar: (rawArgument) => {
        const [, name] = rawArgument.split("::");
        this.variables.incVar(name);
        return "";
      },
      // {{decglobalvar::name}}
      decglobalvar: (rawArgument) => {
        const [, name] = rawArgument.split("::");
        this.variables.decVar(name);
        return "";
      },
      // {{getglobalvar::name}}
      getglobalvar: (rawArgument) => {
        const [, name] = rawArgument.split("::");
        return this.variables.getVar(name);
      },
    };
  }

  async createMessage(config: CreateTurnConfig) {
    const {
      id = uuid(),
      date = new Date(),
      messages = [""],
      role = ChatMessageRole.ASSISTANT,
    } = config;

    const vars = this.getPresetVars();
    const swipes = await Promise.all(messages.map(async message => ({
      createdAt: date,
      prompts: {
        [ChatSwipePrompt.message]: { message: await prepareMessage(message, vars) },
        [ChatSwipePrompt.translate]: { message: "" },
      },
    })));

    const chatMessage = new MessageController(this, {
      id: id,
      chatId: this.chatId,
      createdAt: date,
      role,
      activeSwipe: 0,
      swipes,
    });

    runInAction(() => {
      if (!this.messages) return;
      this.messages = [...this.messages, chatMessage];
      this.messagesDict[id] = chatMessage;
      chatMessage.forceSave();
    });
    return chatMessage;
  }

  getMessagesInterval(startMessageController: MessageController, endMessageController: MessageController) {
    if (!this.messages) return null;
    let startIndex = this.messages.findIndex(m => m.id === startMessageController.id);
    let endIndex = this.messages.findIndex(m => m.id === endMessageController.id);
    if (startIndex === -1 || endIndex === -1) return null;
    if (startIndex >= endIndex) {
      const buffer = endIndex;
      endIndex = startIndex;
      startIndex = buffer;
    }
    return this.messages.slice(startIndex, endIndex + 1).filter(m => m instanceof MessageController);
  }

  private getMessageIndex(messageId?: string) {
    if (!messageId) return undefined;
    if (!this.messages) return undefined;
    const index = this.messages.findIndex(m => m.id === messageId);
    return index === -1 ? undefined : index;
  }
}
