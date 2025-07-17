type ChatSwipePrompt = import( "src/enums/ChatSwipePrompt.ts").ChatSwipePrompt;
type React = import("react");

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

type PromptGenerationConfig = {
  model: string;
  stream?: boolean;
  temperature?: number,
  stopSequences?: string[],
  maxOutputTokens?: number,
  topP?: number,
  topK?: number,
  presencePenalty?: number,
  frequencyPenalty?: number,
  systemPrompt?: string,
}

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

type PresetGenerateMessageConfig = {
  messages: PresetPrompt,
  stopSequences?: string[],
  onUpdate?: (response: BackendProviderOnUpdateEvent) => void,
}

type PromptCreateConfig = {
  isNew?: boolean
}

type CharacterCreateConfig = {
  isNew?: boolean
}

type PersonaCreateConfig = {
  isNew?: boolean
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

type BackendProviderGenerateConfig = {
  baseUrl?: string,
  key?: string,
  model: string,
  stream?: boolean,
  messages: PresetPrompt,
  system?: string,
  stopSequences?: string[],
  maxTokens?: number,
  temperature?: number
  topP?: number,
  topK?: number,
  candidateCount?: number,
  presencePenalty?: number,
  frequencyPenalty?: number,
  thinking?: number,
  onUpdate?: (event: BackendProviderOnUpdateEvent) => void,
  abortController?: AbortController,
}

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
  render?: import("React").FC<import("@xyflow/react").NodeProps>,
  process: (props: FlowProcessContext<D>) => Promise<void> | void,
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
