export const importSeeds = async () => {
  await import("src/store/FlowsManager.ts").then(({ flowsManager }) => flowsManager.importDefault());
  await import("src/store/PromptsManager.ts").then(({ promptsManager }) => promptsManager.importDefault());
  await import("src/store/CodeBlocksManager.ts").then(({ codeBlocksManager }) => codeBlocksManager.importDefault());
};