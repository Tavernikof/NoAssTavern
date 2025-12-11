import { AssistantChatController } from "src/routes/Assistant/helpers/AssistantChatController.ts";
import { assistantMessageStorage, AssistantMessageStorageItem } from "src/storages/AssistantMessageStorage.ts";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import _debounce from "lodash/debounce";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { createEmptyPromptResult } from "src/helpers/createEmptyPromptResult.ts";

export class AssistantMessageController {
  assistantChatController: AssistantChatController;

  id: string;
  assistantChatId: string;
  createdAt: Date;
  role: ChatMessageRole;
  @observable activeSwipe: number;
  @observable swipes: ChatSwipe[];

  @observable pending = false;
  @observable editable = false;

  private editorTextarea: HTMLTextAreaElement | null = null;

  constructor(assistantChatController: AssistantChatController, message: AssistantMessageStorageItem) {
    this.assistantChatController = assistantChatController;

    this.id = message.id;
    this.assistantChatId = message.assistantChatId;
    this.createdAt = message.createdAt;
    this.role = message.role;
    this.activeSwipe = message.activeSwipe;
    this.swipes = message.swipes;

    makeObservable(this);

    reaction(() => this.serialize(), _debounce((object) => {
      assistantMessageStorage.updateItem(object);
    }, 300));
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
  get isLast() {
    return this.id === this.assistantChatController.lastMessageId;
  }

  @action
  changeSwipe(next: boolean = false) {
    if (this.pending) return;
    const nextActiveSwipe = this.activeSwipe + (next ? 1 : -1);
    if (nextActiveSwipe < 0) return;
    if (!this.swipes[nextActiveSwipe]) {
      const newSwipe: ChatSwipe = {
        createdAt: new Date(),
        prompts: {
          message: createEmptyPromptResult(),
        },
      };
      this.swipes.push(newSwipe);

      if (this.role === ChatMessageRole.ASSISTANT) {
        requestAnimationFrame(() => this.assistantChatController.generateMessage(this.id));
      } else {
        this.setEditable(true);
      }
    }
    this.activeSwipe = nextActiveSwipe;
  }

  @action
  setPending(pending: boolean) {
    this.pending = pending;
  }

  @action
  setEditable(editable: boolean) {
    this.editable = editable;
  }

  @action
  updateMessageFromEditor() {
    const message = this.editorTextarea?.value;
    if (typeof message !== "string") return;
    this.message.message = message;
    this.setEditable(false);
  }

  @action
  deleteMessage() {
    this.assistantChatController.deleteMessage(this.id);
  }

  @action
  deleteMessagesAfter() {
    this.assistantChatController.deleteMessagesAfter(this.id);
  }

  @action.bound
  setEditorTextarea(el: HTMLTextAreaElement | null) {
    this.editorTextarea = el;
  }


  forceSave() {
    return assistantMessageStorage.updateItem(this.serialize());
  }

  private serialize(): AssistantMessageStorageItem {
    return {
      id: this.id,
      assistantChatId: this.assistantChatId,
      createdAt: this.createdAt,
      role: this.role,
      activeSwipe: this.activeSwipe,
      swipes: toJS(this.swipes),
    };
  }
}