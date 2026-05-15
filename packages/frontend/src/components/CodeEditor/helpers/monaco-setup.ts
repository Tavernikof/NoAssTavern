import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import globalTypes from "src/helpers/types.d.ts?raw";
import { CODE_BLOCK_FUNCTION_META } from "src/enums/CodeBlockFunction";
import _upperFirst from "lodash/upperFirst";
import { CODE_BLOCK_SNIPPETS } from "./codeBlockSnippets";

export * as monaco from "monaco-editor";

const typeDefinitions = [
  globalTypes,
  ...Object.values(CODE_BLOCK_FUNCTION_META).map(meta => `type ${_upperFirst(meta.name)}Fn = (params: ${_upperFirst(meta.name)}Params) => ${_upperFirst(meta.name)}Params;`),
];

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") return new jsonWorker();
    if (label === "typescript" || label === "javascript") return new tsWorker();
    return new editorWorker();
  },
};

const snippets = CODE_BLOCK_SNIPPETS;

monaco.languages.registerCompletionItemProvider("typescript", {
  provideCompletionItems: function (model, position) {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const typed = word.word.toLowerCase();

    const suggestions = snippets.map(func => {
      const labelLower = func.label.toLowerCase();
      const matchesPrefix = typed.length > 0 && labelLower.startsWith(typed);
      return {
        label: func.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: func.detail,
        documentation: func.documentation,
        insertText: func.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
        sortText: `${matchesPrefix ? "0" : "1"}_${func.label}`,
        preselect: matchesPrefix,
      };
    });

    return { suggestions: suggestions };
  },
});

monaco.typescript.typescriptDefaults.addExtraLib(typeDefinitions.join("\n"), "ts:noasstavern/types.d.ts");

monaco.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.typescript.ScriptTarget.ESNext,
  allowNonTsExtensions: true,
  allowJs: true,
  checkJs: true,
});

