type React = import("react");

type ChatCharacter = {
  character: import("src/store/Character").Character,
  active: boolean,
}

type ChatSwipePromptResult = {
  requestId?: string | null;
  message: string;
  error?: string | null;
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
  role: ChatMessageRole;
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

type PresetFieldConfig = {
  name: string,
  label: string,
  type: import("src/enums/PresetFieldType").PresetFieldType
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

type GlobalStateStorage = {
  openaiKey: string
  geminiKey: string
  claudeKey: string
}

// ============================================================================

type BackendProviderOnUpdateEvent = {
  chunk: string,
};

type BackendProviderGenerateConfig<C extends Record<string, any> = {}> = {
  messageController: import("src/routes/SingleChat/helpers/MessageController").MessageController
  baseUrl?: string,
  key?: string,
  model: string,
  messages: PresetPrompt,
  onUpdate: (event: BackendProviderOnUpdateEvent) => void,
  generationConfig: C,
  abortController: AbortController,
};

type BackendProviderGenerateResponse = {
  message: string,
  error?: string,
  inputTokens: number,
  outputTokens: number,
  url: string,
  request: Record<string, any>
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
  flow: import("src/store/Flow").Flow,
  schemeName: string
  messageController: import("src/routes/SingleChat/helpers/MessageController").MessageController,
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
  flowManager: import("src/store/FlowsManager.ts"),
  charactersManager: import("src/store/CharactersManager.ts"),
  chatsManager: import("src/store/ChatsManager.ts"),
  promptsManager: import("src/store/PromptsManager.ts"),
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
