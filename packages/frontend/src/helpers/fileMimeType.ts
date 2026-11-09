const TEXT_MIME_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/javascript",
  "application/typescript",
  "application/x-yaml",
  "application/yaml",
  "application/x-sh",
  "application/sql",
  "application/toml",
]);

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "markdown", "json", "yaml", "yml", "xml", "csv", "tsv", "html", "htm", "css", "scss", "less",
  "js", "jsx", "ts", "tsx", "mjs", "cjs", "py", "rb", "go", "rs", "java", "kt", "c", "h", "cpp", "hpp", "cs",
  "php", "sh", "bash", "zsh", "sql", "toml", "ini", "cfg", "conf", "log", "env", "vue", "svelte", "swift",
]);

export const isImageMimeType = (mimeType: string) => mimeType.startsWith("image/") && mimeType !== "image/svg+xml";

export const isTextFile = (mimeType: string, name: string) => {
  if (mimeType.startsWith("text/") || TEXT_MIME_TYPES.has(mimeType) || mimeType === "image/svg+xml") return true;
  const ext = name.split(".").pop()?.toLowerCase();
  return Boolean(ext && TEXT_EXTENSIONS.has(ext));
};

export const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};
