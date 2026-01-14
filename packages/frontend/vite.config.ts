import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export const APP_ROOT = path.resolve(import.meta.dirname, "..", "..");

const envDefault = dotenv.parse(fs.readFileSync(path.resolve(APP_ROOT, ".env.default"), { encoding: "utf-8" }));
try {
  const env = dotenv.parse(fs.readFileSync(path.resolve(APP_ROOT, ".env"), { encoding: "utf-8" }));
  Object.assign(envDefault, env);
} catch (e) {
  console.log(".env file not found");
}
dotenv.populate(process.env as dotenv.DotenvPopulateInput, envDefault);

// https://vite.dev/config/
export default defineConfig({
  base: "",
  define: { env: { BACKEND_URL: process.env.BACKEND_URL } },
  server: {
    port: Number(process.env.FRONTEND_PORT) || undefined,
    host: process.env.FRONTEND_HOST,
  },
  optimizeDeps: {
    include: ["monaco-editor"],
  },
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ["decorators-legacy", "classProperties"],
        },
      },
    }),
    // viteSingleFile(),
  ],
  resolve: {
    alias: [
      { find: "src", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "src/styles/global.scss" as *;`,
      },
    },
  },
});
