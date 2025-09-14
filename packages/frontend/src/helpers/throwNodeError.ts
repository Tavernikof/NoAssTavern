import { runInAction } from "mobx";

export const throwNodeError = (message: ChatSwipePromptResult, error: string): never => {
  runInAction(() => message.error = error);
  console.trace(error);
  throw error;
};