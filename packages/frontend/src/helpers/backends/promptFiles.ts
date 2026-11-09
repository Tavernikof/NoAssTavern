import { isImageMimeType } from "src/helpers/fileMimeType.ts";

const toDataUrl = (file: PresetPromptFile) => `data:${file.mimeType};base64,${file.data}`;

export const toOpenaiMessages = (messages: PresetPrompt) => messages.map(({ files, ...block }) => {
  if (!files?.length) return block;
  return {
    ...block,
    content: [
      ...(block.content ? [{ type: "text", text: block.content }] : []),
      ...files.map(file => isImageMimeType(file.mimeType)
        ? { type: "image_url", image_url: { url: toDataUrl(file) } }
        : { type: "file", file: { filename: file.name, file_data: toDataUrl(file) } }),
    ],
  };
});

export const toClaudeMessages = (messages: PresetPrompt) => messages.map(({ files, ...block }) => {
  if (!files?.length) return block;
  return {
    ...block,
    content: [
      ...files.map(file => ({
        type: isImageMimeType(file.mimeType) ? "image" : "document",
        source: { type: "base64", media_type: file.mimeType, data: file.data },
      })),
      ...(block.content ? [{ type: "text", text: block.content }] : []),
    ],
  };
});

export const toGeminiParts = (block: PresetPromptBlock) => [
  ...(block.content || !block.files?.length ? [{ text: block.content }] : []),
  ...(block.files ?? []).map(file => ({ inline_data: { mime_type: file.mimeType, data: file.data } })),
];

/** Collapse multimodal content back to text so RequestModal stays readable */
export const extractTextContent = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return JSON.stringify(content);
  return content.map(part => {
    if (typeof part === "string") return part;
    if (part?.type === "text") return part.text;
    if (part?.type === "image_url" || part?.type === "image") return "[image]";
    if (part?.type === "file") return `[file: ${part.file?.filename ?? ""}]`;
    if (part?.type === "document") return "[document]";
    return "";
  }).filter(Boolean).join("\n");
};
