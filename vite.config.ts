import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  base: "",
  plugins: [react({
    babel: {
      parserOpts: {
        plugins: ["decorators-legacy", "classProperties"],
      },
    },
  })],
  resolve: {
    alias: [
      { find: "src", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ]
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "src/styles/global.scss" as *;`,
      },
    },
  },
});
