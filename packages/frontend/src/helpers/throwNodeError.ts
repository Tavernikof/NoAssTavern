import { runInAction } from "mobx";

export const throwNodeError = (message: ChatSwipePromptResult, error: Error | string): never => {
  runInAction(() => message.error = error instanceof Error ? error.message : error);
  console.trace(error);
  throw error instanceof Error ? error : new Error(error);
};