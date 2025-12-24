type React = import("react");

type ChatCharacter = {
  character: import("src/store/Character.ts").Character,
  active: boolean,
}

type ChatLoreBook = {
  loreBook: import("src/store/LoreBook.ts").LoreBook,
  active: boolean,
}

type ChatSwipePromptImage = {
  imageId: string;
}

type ChatSwipePromptResult = {
  requestId?: string | null;
  message: string;
  error?: string | null;
  images?: ChatSwipePromptImage[];
}

type ChatSwipe = {
  createdAt: Date,
  prompts: {
    [ChatSwipePrompt.message]: ChatSwipePromptResult,
    [ChatSwipePrompt.translate]: ChatSwipePromptResult,
    [key: string]: ChatSwipePromptResult,
  }
}

type CreateTurnConfig = {
  id?: string,
  date?: Date,
  messages?: string[],
  role?: import("src/enums/ChatManagerRole.ts").ChatMessageRole
  pending?: boolean,
  needProcess?: boolean,
}

// ============================================================================

type PromptGenerationConfig = Record<string, any>

type PromptBlock = {
  role: import("src/enums/ChatManagerRole.ts").ChatMessageRole;
  content: PresetBlockContent[];
}

type PresetBlockContent = {
  active: boolean;
  name: string | null;
  content: string;
}

type PresetPrompt = PresetPromptBlock[]

type PresetPromptBlock = {
  role: import("src/enums/ChatManagerRole.ts").ChatMessageRole,
  content: string
}

type PresetVar = (rawArgument: string) => string | undefined

type PresetVars = Record<string, PresetVar>

type GetPresetVarsConfig = {
  fromMessage?: import("src/routes/SingleChat/helpers/MessageController.ts").MessageController
  toMessage?: import("src/routes/SingleChat/helpers/MessageController.ts").MessageController
}

type PresetFieldConfig = {
  name: string,
  label: string,
  type: import("src/enums/PresetFieldType.ts").PresetFieldType,
  options?: string[]
};

type PresetGenerateMessageConfig = {
  messages: PresetPrompt,
  stopSequences?: string[],
  onUpdate?: (response: BackendProviderOnUpdateEvent) => void,
}

// ============================================================================

type ConnectionProxyCreateConfig = {
  isNew?: boolean
}

// ============================================================================

type BackendProviderOnUpdateEvent = {
  chunk: string,
};

type BackendProviderGenerateConfig<C extends Record<string, any> = {}> = {
  baseUrl?: string,
  key?: string,
  model: string,
  messages: PresetPrompt,
  stop?: string[],
  onUpdate: (event: BackendProviderOnUpdateEvent) => void,
  generationConfig: C,
  abortController: AbortController,
};

type BackendProviderGenerateImage = {
  data: string,
  mimeType: string,
}

type BackendProviderGenerateResponse = {
  message: string,
  error?: string,
  inputTokens: number,
  outputTokens: number,
  url: string,
  request: Record<string, any>,
  images?: BackendProviderGenerateImage[],
};

type BackendProviderGetModelsConfig = {
  baseUrl?: string,
  key?: string,
  modelsEndpoint?: string,
}

type BackendProviderGetModelsResponse = {
  label: string,
  value: string
}[]

// ============================================================================

type FlowProcessContext<D = Record<string, any>> = {
  flow: import("src/store/Flow.ts").Flow,
  schemeName: string
  messageController: import("src/routes/SingleChat/helpers/MessageController.ts").MessageController,
  scheme: import("src/storages/FlowsStorage.ts").FlowSchemeState,
  node: import("src/storages/FlowsStorage.ts").FlowSchemeNode<D>,
  abortController: AbortController,
}

type FlowNodeConfig<D = Record<string, any>> = {
  id: string,
  label: string,
  description: string,
  initialState?: D
  render?: React.FC<import("@xyflow/react").NodeProps>,
  process: (props: FlowProcessContext<D>) => Promise<void> | void,
}

// ============================================================================

interface Window {
  assistantChatsManager: import("src/store/AssistantChatsManager.ts").AssistantChatsManager,
  flowsManager: import("src/store/FlowsManager.ts").FlowsManager,
  charactersManager: import("src/store/CharactersManager.ts").CharactersManager,
  chatsManager: import("src/store/ChatsManager.ts").ChatsManager,
  promptsManager: import("src/store/PromptsManager.ts").PromptsManager,
  imagesManager: import("src/store/ImagesManager.ts").ImagesManager,
  loreBookManager: import("src/store/LoreBookManager.ts").LoreBookManager,
  globalSettings: import("src/store/GlobalSettings.ts").GlobalSettings,
  backupManager: import("src/store/BackupManager.ts").BackupManager,
  env: Record<string, string>
}

// ============================================================================

type AssistantSettings = {
  backendProviderId: import("src/enums/BackendProvider.ts").BackendProvider;
  connectionProxyId: string | null;
  model: string | null;
  generationConfig: PromptGenerationConfig;
}

// ============================================================================

type PickType<O, T> = {
  [K in keyof O as O[K] extends T ? K : never]: O[K]
};

type ChildClass<T extends Super = Super> = new (...args: any[]) => T;

type ClassFields<T> = {
  [K in keyof T]: T[K];
};

type ReactUseState<V> = [V, React.Dispatch<React.SetStateAction<V>>];
