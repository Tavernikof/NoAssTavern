import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import globalTypes from "src/helpers/types.d.ts?raw";
import { CODE_BLOCK_FUNCTION_META } from "src/enums/CodeBlockFunction";
import _upperFirst from "lodash/upperFirst";

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

const snippets = Object.values(CODE_BLOCK_FUNCTION_META).map((meta) => ({
  label: meta.name,
  detail: meta.documentation,
  // detail: `function ${meta.name}(params: ${_upperFirst(meta.name)}Params): ${_upperFirst(meta.name)}Params`,
  documentation: meta.documentation,
  insertText: `/** @type {${_upperFirst(meta.name)}Fn} */
function ${meta.name}(params) {
  $0
  return params;
}
`,
}));

monaco.languages.registerCompletionItemProvider("typescript", {
  provideCompletionItems: function (model, position) {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const suggestions = snippets.map(func => ({
      label: func.label,
      kind: monaco.languages.CompletionItemKind.Snippet,
      detail: func.detail,
      documentation: func.documentation,
      insertText: func.insertText,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    }));

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

