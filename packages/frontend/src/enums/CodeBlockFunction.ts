export enum CodeBlockFunction {
  preHistory = "preHistory",
  onMessage = "onMessage",
}

// WARNING: types should be defined at src/helpers/types.d.ts to make in work in monaco
export interface CodeBlockFunctionSignatures {
  [CodeBlockFunction.preHistory]: PreHistoryParams;
  [CodeBlockFunction.onMessage]: OnMessageParams;
}

export type CodeBlockFunctionArg<T extends CodeBlockFunction> =
  T extends keyof CodeBlockFunctionSignatures
    ? CodeBlockFunctionSignatures[T]
    : unknown;

export const CODE_BLOCK_FUNCTION_META: Record<CodeBlockFunction, CodeBlockFunctionMeta> = {
  [CodeBlockFunction.preHistory]: {
    name: "preHistory",
    documentation: "Calls before collection messages in {{history}} variable",
  },
  [CodeBlockFunction.onMessage]: {
    name: "onMessage",
    documentation: "Calls on every chunk received and after all message generated",
  },
};
