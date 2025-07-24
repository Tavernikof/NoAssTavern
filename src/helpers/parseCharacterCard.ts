import { getMetadata } from "meta-png";
import { decodeBase64 } from "src/helpers/decodeBase64.ts";
import Exifreader, { Tags } from "exifreader";

const parseMetadata = (file: File): Promise<Record<string, any> | null> => {
  return file.arrayBuffer().then(arrayBuffer => {
    const buffer = new Uint8Array(arrayBuffer);
    const meta = getMetadata(buffer, "chara");
    if (!meta) return null;
    return decodeBase64(meta);
  }, () => null);
};

const parseExif = (file: File): Promise<Record<string, any> | null> => {
  return (Exifreader.load(file) as unknown as Promise<Tags>).then(tags => {
    const description = tags?.chara?.value;
    if (!description) return null;
    return decodeBase64(description);
  });
};

export const parseCharacterCard = async (file: File) => {
  let info = await parseMetadata(file);
  if (!info) info = await parseExif(file);
  return info
};