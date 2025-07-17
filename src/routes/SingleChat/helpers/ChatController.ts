import { action, autorun, computed, makeObservable, observable, runInAction } from "mobx";
import { v4 as uuid } from "uuid";
import { charactersManager } from "src/store/CharactersManager.ts";
import { MessageController } from "./MessageController.ts";
import { messageStorage } from "src/storages/MessageStorage.ts";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { chatsManager } from "src/store/ChatsManager.ts";
import { personasManager } from "src/store/PersonasManager.ts";
import { sliceFromEnd } from "src/routes/SingleChat/helpers/slideFromEnd.ts";
import randomInt from "src/helpers/randomInt.ts";
import { flowsManager } from "src/store/FlowsManager.ts";
import { prepareMessage } from "src/helpers/prepareMessage.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { DisposableContainer } from "src/helpers/DisposableContainer.ts";

export class ChatController {
  private dc = new DisposableContainer();

  chatId: string;
  @observable.ref messages: MessageController[] | undefined;
  messagesDict: Record<string, MessageController> = {};

  constructor(chatId: string) {
    this.chatId = chatId;
    makeObservable(this);

    messageStorage.getItems(this.chatId).then(action(messages => {
      if (this.dc.disposed) return;

      this.messagesDict = {};

      this.messages = messages.map(message => {
        const chatMessage = new MessageController(this, message);
        this.messagesDict[chatMessage.id] = chatMessage;
        return chatMessage;
      });

      if (!messages.length) {
        const greetings = [...this.character.greetings];
        if (!greetings.length) greetings.push("");
        this.createMessage({
          messages: greetings,
          date: new Date(),
        });
      }

      setTimeout(() => {
        const messages = this.messages;
        if (!messages) return;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) lastMessage.focusEditor();
      });
    }));

    this.dc.addReaction(autorun(() => {
      if (!this.messages) return;
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
    return chatsManager.chatsDict[this.chatId];
  }

  @computed
  get character() {
    return charactersManager.charactersDict[this.chat.characterId];
  }

  @computed
  get persona() {
    return personasManager.personasDict[this.chat.personId];
  }

  @computed
  get flow() {
    return flowsManager.flowsDict[this.chat.flowId];
  }

  @computed
  get lastMessage(): MessageController | undefined {
    const messages = this.messages;
    if (!messages) return undefined;
    return messages[messages.length - 1];
  }

  @computed
  get firstMessageId() {
    if (!this.messages) return null;
    return this.messages[0].id;
  }

  @computed
  get lastMessageId() {
    return this.lastMessage?.id;
  }

  getUserPrefix() {
    return prepareMessage(this.flow.userPrefix, this.getPresetVars());
  }

  @action
  deleteMessage(messageId: string) {
    if (!this.messages) return;
    const message = this.messagesDict[messageId];
    delete this.messagesDict[messageId];
    this.messages = this.messages.filter(m => m.id !== messageId);
    return chatsManager.removeMessage(message);
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

  createEmptyUserMessage(date?: Date) {
    return this.createMessage({
      messages: [this.flow.userPrefix],
      role: ChatMessageRole.USER,
      date: date ?? new Date(),
    });
  }

  getPresetVars(toMessage: MessageController | undefined = this.lastMessage): PresetVars {
    const toMessageIndex = this.getMessageIndex(toMessage?.id);

    return {
      user: () => this.persona.name,
      persona: () => this.persona.description,

      char: () => this.character.name,
      description: () => this.character.description,
      scenario: () => this.character.scenario,
      personality: () => this.character.personality,

      // Сообщения в порядке возрастания даты. Старые - первые
      // {{history}} - все сообщения
      // {{history:1:10}} - последние 10 сообщений с конца
      // {{history::10}} - последние 10 сообщений с конца
      // {{history:11}} - все сообщения начиная с 11 с конца
      // {{history:7:10}} - последние 3 сообщения начиная с 7
      history: (rawArgument) => {
        let messages = this.messages ?? [];
        if (typeof toMessageIndex === "number") messages = messages.slice(0, toMessageIndex + 1);

        const [from, to] = rawArgument.split(":").filter(Boolean);
        messages = sliceFromEnd(messages, +from || null, +to || null);

        return messages
          .map(m => m.message.message.trim())
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
          if (message.role === ChatMessageRole.USER) return message.message.message.trim();
        }
        return "";
      },

      random: (rawArgument) => { // {{random::value 1::value 2}}
        if (!rawArgument) return "";

        const list = rawArgument.includes("::")
          ? rawArgument.split("::")
          // Replaced escaped commas with a placeholder to avoid splitting on them
          : rawArgument.replace(/\\,/g, "##�COMMA�##").split(",").map(item => item.trim().replace(/##�COMMA�##/g, ","));

        if (list.length === 0) {
          return "";
        }
        const randomIndex = randomInt(0, list.length - 1);
        return list[randomIndex];
      },

      // // Replace {{setvar::name::value}} with empty string and set the variable name to value
      // { regex: /{{setvar::([^:]+)::([^}]+)}}/gi, replace: (_, name, value) => { setLocalVariable(name.trim(), value); return ''; } },
      // // Replace {{addvar::name::value}} with empty string and add value to the variable value
      // { regex: /{{addvar::([^:]+)::([^}]+)}}/gi, replace: (_, name, value) => { addLocalVariable(name.trim(), value); return ''; } },
      // // Replace {{incvar::name}} with empty string and increment the variable name by 1
      // { regex: /{{incvar::([^}]+)}}/gi, replace: (_, name) => incrementLocalVariable(name.trim()) },
      // // Replace {{decvar::name}} with empty string and decrement the variable name by 1
      // { regex: /{{decvar::([^}]+)}}/gi, replace: (_, name) => decrementLocalVariable(name.trim()) },
      // // Replace {{getvar::name}} with the value of the variable name
      // { regex: /{{getvar::([^}]+)}}/gi, replace: (_, name) => getLocalVariable(name.trim()) },
      // // Replace {{setglobalvar::name::value}} with empty string and set the global variable name to value
      // { regex: /{{setglobalvar::([^:]+)::([^}]+)}}/gi, replace: (_, name, value) => { setGlobalVariable(name.trim(), value); return ''; } },
      // // Replace {{addglobalvar::name::value}} with empty string and add value to the global variable value
      // { regex: /{{addglobalvar::([^:]+)::([^}]+)}}/gi, replace: (_, name, value) => { addGlobalVariable(name.trim(), value); return ''; } },
      // // Replace {{incglobalvar::name}} with empty string and increment the global variable name by 1
      // { regex: /{{incglobalvar::([^}]+)}}/gi, replace: (_, name) => incrementGlobalVariable(name.trim()) },
      // // Replace {{decglobalvar::name}} with empty string and decrement the global variable name by 1
      // { regex: /{{decglobalvar::([^}]+)}}/gi, replace: (_, name) => decrementGlobalVariable(name.trim()) },
      // // Replace {{getglobalvar::name}} with the value of the global variable name
      // { regex: /{{getglobalvar::([^}]+)}}/gi, replace: (_, name) => getGlobalVariable(name.trim()) },
    };
  }

  createMessage(config: CreateTurnConfig) {
    const {
      id = uuid(),
      date = new Date(),
      messages = [""],
      role = ChatMessageRole.ASSISTANT,
    } = config;
    const chatMessage = new MessageController(this, {
      id: id,
      chatId: this.chatId,
      createdAt: date,
      role,
      activeSwipe: 0,
      swipes: messages.map(message => ({
        createdAt: date,
        prompts: {
          [ChatSwipePrompt.message]: { message: prepareMessage(message, this.getPresetVars()) },
          [ChatSwipePrompt.translate]: { message: "" },
        },
      })),
    });

    runInAction(() => {
      if (!this.messages) return;
      this.messages = [...this.messages, chatMessage];
      this.messagesDict[id] = chatMessage;
    });
    return chatMessage;
  }

  private getMessageIndex(messageId?: string) {
    if (!messageId) return undefined;
    if (!this.messages) return undefined;
    const index = this.messages.findIndex(m => m.id === messageId);
    return index === -1 ? undefined : index;
  }
}
