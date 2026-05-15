import globalTypes from "src/helpers/types.d.ts?raw";
import { CODE_BLOCK_FUNCTION_META } from "src/enums/CodeBlockFunction";
import _upperFirst from "lodash/upperFirst";
import { extractParamFields } from "./extractParamFields";

export type CodeBlockSnippet = {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
};

export const CODE_BLOCK_SNIPPETS: CodeBlockSnippet[] = Object.values(CODE_BLOCK_FUNCTION_META).map((meta) => {
  const typeName = `${_upperFirst(meta.name)}Params`;
  const fields = extractParamFields(globalTypes, typeName);
  const fieldLines = fields.map(f => `  params.${f} = params.${f};`).join("\n");
  const body = fieldLines ? `${fieldLines}\n  $0` : "  $0";

  return {
    label: meta.name,
    detail: meta.documentation,
    documentation: meta.documentation,
    insertText: `/** @type {${typeName.replace("Params", "Fn")}} */
function ${meta.name}(params) {
${body}
  return params;
}
`,
  };
});
