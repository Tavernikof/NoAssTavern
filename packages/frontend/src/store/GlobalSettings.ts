import { action, autorun, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import parseJSON from "src/helpers/parseJSON.ts";
import { BackendStorageType } from "src/enums/BackendStorageType.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { globalSettingsStorage, GlobalSettingsStorageItem } from "src/storages/GlobalSettingsStorage.ts";

const DEFAULT_BACKEND_URL = env.BACKEND_URL;
const LOCALSTORAGE_CONNECTION_KEY = "noass-tavern-connection-settings";

class GlobalSettings {
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

    this.initializeApp().then(async () => {
      reaction(
        () => this.serializeGlobalSettings(),
        (state) => globalSettingsStorage.save(state),
      );
    });
  }

  async initializeApp() {
    this.loadConnectionSettings();
    await backendManager.refreshIsConnected();
    if (typeof this.storageType === "undefined" && backendManager.isConnected) {
      runInAction(() => this.storageType = BackendStorageType.backend);
    }
    await this.loadGlobalSettings();

    if (!this.seedsImported) {
      import("src/helpers/seeds").then(async ({ createPromptSeeds, createFlowSeeds }) => {
        await createPromptSeeds();
        await createFlowSeeds();
      });
      runInAction(() => this.seedsImported = true);
      globalSettingsStorage.save(this.serializeGlobalSettings());
    }

    runInAction(() => this.ready = true);
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
    });
  }


  private serializeGlobalSettings(): GlobalSettingsStorageItem {
    return {
      seedsImported: this.seedsImported,
      openaiKey: this.openaiKey,
      geminiKey: this.geminiKey,
      claudeKey: this.claudeKey,
      proxyRequestsThroughBackend: this.proxyRequestsThroughBackend,
      socks5: this.socks5,
    };
  }
}

export const globalSettings = new GlobalSettings();
window.globalSettings = globalSettings;