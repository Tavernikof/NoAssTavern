import { action, autorun, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import parseJSON from "src/helpers/parseJSON.ts";
import { BackendStorageType } from "src/enums/BackendStorageType.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { globalSettingsStorage, GlobalSettingsStorageItem } from "src/storages/GlobalSettingsStorage.ts";
import _isObject from "lodash/isObject";
import { BackendProvider, backendProviderDict } from "src/enums/BackendProvider.ts";
import type { CodeBlocksManager } from "src/store/CodeBlocksManager.ts";
import type { PromptCodeBlockStorageItem } from "src/storages/PromptsStorage.ts";
import type { CodeBlockFunction, CodeBlockFunctionArg } from "src/enums/CodeBlockFunction.ts";

const DEFAULT_BACKEND_URL = env.BACKEND_URL;
const LOCALSTORAGE_CONNECTION_KEY = "noass-tavern-connection-settings";

export class GlobalSettings {
  @observable ready = false;

  @observable storageType: BackendStorageType;
  @observable tempStorageType: BackendStorageType | null = null;
  @observable backendUrl: string = DEFAULT_BACKEND_URL;

  @observable seedsImported: boolean;
  @observable openaiKey: string;
  @observable geminiKey: string;
  @observable claudeKey: string;
  @observable proxyRequestsThroughBackend: boolean;
  @observable socks5: string;
  @observable notificationFile: string | null = null;

  @observable.ref defaultAssistantSettings: AssistantSettings | null = null;
  @observable.ref assistantCodeBlocks: PromptCodeBlock[] = [];

  notificationAudio: HTMLAudioElement | null = null;
  pageActive = document.hidden;
  // loaded lazily to avoid circular import (CodeBlocksManager -> AbstractManager -> GlobalSettings)
  private codeBlocksManager: CodeBlocksManager | null = null;

  constructor() {
    makeObservable(this);

    autorun(() => backendManager.setBaseUrl(this.backendUrl));
    autorun(() => backendManager.setUseProxy(this.isBackendEnabled && this.proxyRequestsThroughBackend));
    autorun(() => backendManager.setSocks5(this.socks5));
    reaction(
      () => ({
        storageType: this.storageType,
        backendUrl: this.backendUrl,
      }),
      (state) => localStorage[LOCALSTORAGE_CONNECTION_KEY] = JSON.stringify(state),
    );
    autorun(() => {
      if (this.notificationFile) {
        this.notificationAudio = new Audio(this.notificationFile);
      } else {
        import("src/seeds/notification.mp3?no-inline").then(({ default: audioUrl }) => {
          this.notificationAudio = new Audio(audioUrl);
        });
      }
    });

    this.initializeApp().then(async () => {
      reaction(
        () => this.serializeGlobalSettings(),
        (state) => globalSettingsStorage.save(state),
      );
    });

    document.addEventListener("visibilitychange", () => {
      this.pageActive = !document.hidden;
    });
  }

  async initializeApp() {
    this.loadConnectionSettings();
    await backendManager.refreshIsConnected();
    this.codeBlocksManager = await import("src/store/CodeBlocksManager.ts").then(({ codeBlocksManager }) => codeBlocksManager);
    if (typeof this.storageType === "undefined" && backendManager.isConnected) {
      runInAction(() => this.storageType = BackendStorageType.backend);
    }
    await this.loadGlobalSettings();

    const seedsImported = this.seedsImported;
    if (!seedsImported) {
      runInAction(() => this.seedsImported = true);
      globalSettingsStorage.save(this.serializeGlobalSettings());
    }

    runInAction(() => this.ready = true);

    if (!seedsImported) {
      await import("src/helpers/importSeeds.ts").then(({ importSeeds }) => importSeeds());
    }
  }

  @computed
  get isBackendEnabled() {
    if (this.tempStorageType) return this.tempStorageType === BackendStorageType.backend;
    return this.storageType === BackendStorageType.backend;
  }

  @action.bound
  updateOpenaiKey(key: string) {
    this.openaiKey = key;
  }

  @action.bound
  updateGeminiKey(key: string) {
    this.geminiKey = key;
  }

  @action.bound
  updateClaudeKey(key: string) {
    this.claudeKey = key;
  }

  @action.bound
  updateProxyRequests(proxyRequests: boolean) {
    this.proxyRequestsThroughBackend = proxyRequests;
  }

  @action.bound
  updateSocks5(socks5: string) {
    this.socks5 = socks5;
  }

  @action.bound
  updateNotificationSound(file: File | null) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        if (!dataUrl) return;
        const testAudio = new Audio(dataUrl);
        testAudio.play().then(() => {
          localStorage.setItem("customSound", dataUrl);
          this.notificationFile = dataUrl;
          this.notificationAudio = new Audio(dataUrl);
        }).catch(err => {
          console.error(err);
          alert("Wrong file");
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.notificationFile = null;
    }
  }

  @action
  updateDefaultAssistantSettings(defaultAssistantSettings: AssistantSettings) {
    defaultAssistantSettings = this.normalizeDefaultAssistantSettings(defaultAssistantSettings);
    this.defaultAssistantSettings = defaultAssistantSettings;
  }

  @computed
  get activeAssistantCodeBlocksCount() {
    return this.assistantCodeBlocks.filter(item => item.active).length;
  }

  @action
  updateAssistantCodeBlocks(codeBlocks: PromptCodeBlockStorageItem[]) {
    if (!this.codeBlocksManager) return;
    this.assistantCodeBlocks = this.codeBlocksManager.syncPromptCodeBlocks(
      this.assistantCodeBlocks,
      codeBlocks as unknown as PromptCodeBlock[],
    );
  }

  async callAssistantCodeBlockFunction<T extends CodeBlockFunction>(
    functionName: T,
    arg: CodeBlockFunctionArg<T>,
  ) {
    if (!this.codeBlocksManager) return arg;
    return this.codeBlocksManager.callCodeBlockFunction(this.assistantCodeBlocks, functionName, arg);
  }

  playNotificationAudio() {
    this.notificationAudio?.play();
  }

  @action
  loadConnectionSettings() {
    const state = parseJSON(localStorage[LOCALSTORAGE_CONNECTION_KEY]);
    if (!state) return;
    if (typeof state.storageType !== "undefined") this.storageType = state.storageType as BackendStorageType;
    this.backendUrl = state.backendUrl;
  }

  async loadGlobalSettings() {
    const state = await globalSettingsStorage.get();
    if (!state) return;
    runInAction(() => {
      this.seedsImported = Boolean(state.seedsImported);
      this.openaiKey = typeof state.openaiKey === "string" ? state.openaiKey : "";
      this.geminiKey = typeof state.geminiKey === "string" ? state.geminiKey : "";
      this.claudeKey = typeof state.claudeKey === "string" ? state.claudeKey : "";
      this.proxyRequestsThroughBackend = Boolean(state.proxyRequestsThroughBackend);
      this.socks5 = typeof state.socks5 === "string" ? state.socks5 : "";
      this.notificationFile = typeof state.notificationFile === "string" ? state.notificationFile : null;
      this.defaultAssistantSettings = this.normalizeDefaultAssistantSettings(state.defaultAssistantSettings);
      this.updateAssistantCodeBlocks(Array.isArray(state.assistantCodeBlocks) ? state.assistantCodeBlocks : []);
    });
  }

  normalizeDefaultAssistantSettings(defaultAssistantSettings: AssistantSettings | null): AssistantSettings {
    let backendProviderId: AssistantSettings["backendProviderId"] = BackendProvider.OPENAI;
    let connectionProxyId: AssistantSettings["connectionProxyId"] = null;
    let model: AssistantSettings["model"] = null;
    let generationConfig: AssistantSettings["generationConfig"] = {};
    if (defaultAssistantSettings && _isObject(defaultAssistantSettings)) {
      if (typeof defaultAssistantSettings.backendProviderId === "string" && backendProviderDict.dict[defaultAssistantSettings.backendProviderId as BackendProvider]) {
        backendProviderId = defaultAssistantSettings.backendProviderId;
      }
      connectionProxyId = typeof defaultAssistantSettings.connectionProxyId === "string"
        ? defaultAssistantSettings.connectionProxyId
        : null;
      model = typeof defaultAssistantSettings.model === "string"
        ? defaultAssistantSettings.model
        : null;
      generationConfig = defaultAssistantSettings.generationConfig && _isObject(defaultAssistantSettings.generationConfig)
        ? defaultAssistantSettings.generationConfig
        : {};
    }
    return {
      backendProviderId,
      connectionProxyId,
      model,
      generationConfig,
    };
  }

  private serializeGlobalSettings(): GlobalSettingsStorageItem {
    return {
      seedsImported: this.seedsImported,
      openaiKey: this.openaiKey,
      geminiKey: this.geminiKey,
      claudeKey: this.claudeKey,
      proxyRequestsThroughBackend: this.proxyRequestsThroughBackend,
      socks5: this.socks5,
      notificationFile: this.notificationFile,
      defaultAssistantSettings: this.defaultAssistantSettings,
      assistantCodeBlocks: this.assistantCodeBlocks.map(item => ({ ...item, codeBlock: item.codeBlock.serialize() })),
    };
  }
}

export const globalSettings = new GlobalSettings();
window.globalSettings = globalSettings;