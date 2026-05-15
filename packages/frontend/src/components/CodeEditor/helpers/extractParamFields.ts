export function extractParamFields(typesSource: string, typeName: string): string[] {
  const header = `type ${typeName} = {`;
  const headerIndex = typesSource.indexOf(header);
  if (headerIndex === -1) return [];

  const bodyStart = headerIndex + header.length;
  let depth = 1;
  let bodyEnd = -1;
  for (let i = bodyStart; i < typesSource.length; i++) {
    const ch = typesSource[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        bodyEnd = i;
        break;
      }
    }
  }
  if (bodyEnd === -1) return [];

  const body = typesSource.slice(bodyStart, bodyEnd);
  const fields: string[] = [];
  let bracketDepth = 0;
  let braceDepth = 0;
  let parenDepth = 0;
  let current = "";

  const flush = () => {
    const entry = current.trim();
    current = "";
    if (!entry) return;
    if (entry.startsWith("[")) return;
    const colonIndex = entry.indexOf(":");
    const namePart = (colonIndex === -1 ? entry : entry.slice(0, colonIndex)).trim();
    const name = namePart.replace(/\?$/, "").trim();
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) fields.push(name);
  };

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "[") bracketDepth++;
    else if (ch === "]") bracketDepth--;
    else if (ch === "{") braceDepth++;
    else if (ch === "}") braceDepth--;
    else if (ch === "(") parenDepth++;
    else if (ch === ")") parenDepth--;

    if ((ch === "," || ch === ";" || ch === "\n") && bracketDepth === 0 && braceDepth === 0 && parenDepth === 0) {
      flush();
      continue;
    }
    current += ch;
  }
  flush();

  return fields;
}
