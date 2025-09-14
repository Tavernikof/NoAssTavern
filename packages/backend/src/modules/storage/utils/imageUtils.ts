import path from "path";
import fs from "fs";
import sharp from "sharp";

export async function resizeAndCacheImage(originalPath: string, cacheDir: string, size: number) {
  const ext = path.extname(originalPath);
  const name = path.basename(originalPath, ext);
  const cachedFile = path.join(cacheDir, `${name}_${size}${ext}`);

  if (fs.existsSync(cachedFile)) {
    return fs.promises.readFile(cachedFile);
  }

  await sharp(originalPath).resize(size, size, { fit: "cover" }).toFile(cachedFile);
  return fs.promises.readFile(cachedFile);
}
