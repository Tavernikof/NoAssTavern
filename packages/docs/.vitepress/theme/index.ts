import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

import ImageViewerP from "@miletorix/vitepress-image-viewer";
import "@miletorix/vitepress-image-viewer/style.css";
import C from "../components/C.vue";

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ImageViewerP(ctx.app);
    ctx.app.component("C", C);
  },
};