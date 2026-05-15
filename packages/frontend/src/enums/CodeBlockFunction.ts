export enum CodeBlockFunction {
  preHistory = "preHistory",
  onMessage = "onMessage",
  formatMessage = "formatMessage",
}

// WARNING: types should be defined at src/helpers/types.d.ts to make in work in monaco
export interface CodeBlockFunctionSignatures {
  [CodeBlockFunction.preHistory]: PreHistoryParams;
  [CodeBlockFunction.onMessage]: OnMessageParams;
  [CodeBlockFunction.formatMessage]: FormatMessageParams;
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
    documentation: "Modify source message. Calls on every chunk received and after all message generated",
  },
  [CodeBlockFunction.formatMessage]: {
    name: "formatMessage",
    documentation: "Formats the display of a message without affecting the original message. Calls on every chunk received and after all message generated",
  },
};
