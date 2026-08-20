import { v4 as uuid } from "uuid";
import type { PromptCodeBlockStorageItem } from "src/storages/PromptsStorage.ts";

export type TavernRegexScript = {
  id?: string;
  scriptName?: string;
  findRegex?: string;
  replaceString?: string;
  trimStrings?: string[];
  placement?: number[];
  disabled?: boolean;
  markdownOnly?: boolean;
  promptOnly?: boolean;
  runOnEdit?: boolean;
  substituteRegex?: number;
  minDepth?: number;
  maxDepth?: number;
}

// Code block content is inlined into a `<script>` tag inside the sandbox iframe,
// so `</script` must never appear in it. Escaping every unescaped `/` is enough:
// `\/` means `/` both in a regex literal and in a string literal.
const escapeSlashes = (source: string) => source.replace(/\\.|\//gs, match => match === "/" ? "\\/" : match);

const parseFindRegex = (findRegex: string) => {
  const literal = /^\/(.*)\/([a-z]*)$/s.exec(findRegex.trim());
  const source = literal ? literal[1] : findRegex;
  const flags = literal ? literal[2] : "";
  if (!source) return null;
  try {
    new RegExp(source, flags);
  } catch {
    return null;
  }
  return { source, flags };
};

const buildContent = (script: TavernRegexScript, source: string, flags: string) => {
  // `{{match}}` is the tavern placeholder for the whole match, capture groups ($1...) work as is
  const replaceString = (script.replaceString ?? "").replace(/{{match}}/g, "$$&");
  const lines = [
    "/** @type {OnMessageFn} */",
    "async function onMessage(params) {",
  ];
  if (script.trimStrings?.length) {
    lines.push(`  // trimStrings из tavern не перенесены: ${escapeSlashes(JSON.stringify(script.trimStrings))}`);
  }
  lines.push(
    `  params.message = params.message.replace(/${escapeSlashes(source)}/${flags}, ${escapeSlashes(JSON.stringify(replaceString))});`,
    "  return params;",
    "}",
    "",
  );
  return lines.join("\n");
};

export const regexScriptsToCodeBlocks = (scripts: unknown): PromptCodeBlockStorageItem[] => {
  if (!Array.isArray(scripts)) return [];

  return (scripts as TavernRegexScript[]).reduce<PromptCodeBlockStorageItem[]>((codeBlocks, script) => {
    if (!script || typeof script.findRegex !== "string") return codeBlocks;

    const parsed = parseFindRegex(script.findRegex);
    if (!parsed) return codeBlocks;

    codeBlocks.push({
      active: !script.disabled,
      codeBlock: {
        id: uuid(),
        createdAt: new Date(),
        name: script.scriptName?.trim() || "Regex script",
        content: buildContent(script, parsed.source, parsed.flags),
      },
    });

    return codeBlocks;
  }, []);
};
