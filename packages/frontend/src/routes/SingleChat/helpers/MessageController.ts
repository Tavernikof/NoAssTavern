import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { ChatMessageStorageItem, messageStorage } from "src/storages/MessageStorage.ts";
import { ChatMessageEditor } from "./ChatMessageEditor.ts";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { ChatController } from "src/routes/SingleChat/helpers/ChatController.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { SchemeName } from "src/enums/SchemeName.ts";

export class MessageController {
  chatController: ChatController;

  id: string;
  chatId: string;
  createdAt: Date;
  role: ChatMessageRole;
  @observable activeSwipe: number;
  @observable swipes: ChatSwipe[];

  @observable pending = false;
  @observable editable = false;
  @observable showTranslate = false;

  @observable.ref editor: ChatMessageEditor | null = null;

  constructor(chatController: ChatController, message: ChatMessageStorageItem) {
    this.chatController = chatController;

    this.id = message.id;
    this.chatId = message.chatId;
    this.createdAt = message.createdAt;
    this.role = message.role;
    this.activeSwipe = message.activeSwipe;
    this.swipes = message.swipes;

    makeObservable(this);

    reaction(() => this.serialize(), (object) => {
      messageStorage.updateItem(object);
    });

    reaction(() => this.editable, (editable) => {
      if (editable) {
        this.editor = new ChatMessageEditor(this.chatController, this.message.message);

        this.editor.on("submit", action(() => {
          if (this.isLast) {
            this.submit();
          } else {
            this.updateMessageFromEditor();
          }
        }));

        this.editor.on("cancel", () => {
          this.setEditable(false);
        });
      } else {
        this.editor = null;
      }
    });
  }

  @computed
  get isFirst() {
    return this.id === this.chatController.firstMessageId;
  }

  @computed
  get isLast() {
    return this.id === this.chatController.lastMessageId;
  }

  @computed
  get isAssistant() {
    return this.role === ChatMessageRole.ASSISTANT;
  }

  @computed
  get currentSwipe() {
    return this.swipes[this.activeSwipe];
  }

  @computed
  get message(): ChatSwipePromptResult {
    return this.currentSwipe.prompts[ChatSwipePrompt.message];
  }

  @computed
  get translate(): ChatSwipePromptResult {
    return this.currentSwipe.prompts[ChatSwipePrompt.translate];
  }

  @action
  toggleTranslate() {
    this.showTranslate = !this.showTranslate;
    if (this.showTranslate && !this.translate.message) {
      return this.chatController.processRequest(SchemeName.translate, this);
    }
  }

  @action
  regenerateExtraBlock(extraBlockId: string) {
    this.chatController.processRequest(extraBlockId, this);
  }

  @action
  changeSwipe(next: boolean = false) {
    const nextActiveSwipe = this.activeSwipe + (next ? 1 : -1);
    if (nextActiveSwipe < 0) return;
    if (!this.swipes[nextActiveSwipe]) {
      const newSwipe: ChatSwipe = {
        createdAt: new Date(),
        prompts: {
          message: this.createEmptyPromptResult(),
          translate: this.createEmptyPromptResult(),
        },
      };
      this.swipes.push(newSwipe);
      setTimeout(() => this.chatController.processRequest(SchemeName.generate, this));
    }
    this.activeSwipe = nextActiveSwipe;
  }

  @action
  setEditable(editable?: boolean) {
    this.editable = editable ?? !this.editable;
  }

  @action
  updateMessageFromEditor() {
    const { editor } = this;
    if (!editor) return;
    const content = editor.getContent();
    this.editable = false;
    if (content !== this.message.message) {
      this.message.message = content;
      return this.chatController.processRequest(SchemeName.translate, this);
    }
  }

  @action
  updateExtraBlock(extraBlockKey: string, message: string) {
    const externalBlock = this.currentSwipe.prompts[extraBlockKey];
    if (externalBlock) externalBlock.message = message;
  }

  @action
  async submit() {
    const { editor } = this;
    if (editor) {
      this.message.message = editor.getContent();
      this.editable = false;
    }
    return this.chatController.processRequest(SchemeName.main, this);
  }

  focusEditor() {
    if (!this.editor) this.setEditable(true);
    requestAnimationFrame(() => {
      this.editor?.focusEditor();
    });
  }

  createEmptyPromptResult(): ChatSwipePromptResult {
    return { requestId: null, message: "", error: null };
  }

  getPresetVars() {
    return this.chatController.getPresetVars(this);
  }

  forceSave() {
    return messageStorage.updateItem(this.serialize());
  }

  private serialize(): ChatMessageStorageItem {
    return {
      id: this.id,
      chatId: this.chatId,
      createdAt: this.createdAt,
      role: this.role,
      activeSwipe: this.activeSwipe,
      swipes: toJS(this.swipes),
    };
  }
}