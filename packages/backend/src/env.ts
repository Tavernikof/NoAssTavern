import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const APP_ROOT = path.resolve(__dirname, "..", "..", "..");
export const STORAGE_DIR = path.resolve(APP_ROOT, 'storage');
const envDefault = dotenv.parse(fs.readFileSync(path.resolve(APP_ROOT, ".env.default"), { encoding: "utf-8" }));
try {
  const env = dotenv.parse(fs.readFileSync(path.resolve(APP_ROOT, ".env"), { encoding: "utf-8" }));
  Object.assign(envDefault, env);
} catch (e) {

}
dotenv.populate(process.env as dotenv.DotenvPopulateInput, envDefault);
