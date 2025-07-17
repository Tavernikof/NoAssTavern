import * as React from "react";

export type RouteItem = Readonly<{
  path: string,
  name: string,
  component: () => Promise<{ default: React.FC }>,
  layout: () => Promise<{ default: React.FC }>,
}>;

const AppLayout = () => import("src/components/App/components/AppLayout");

export const routes = [
  {
    path: "/",
    name: "front",
    component: () => import("src/routes/Front"),
    layout: AppLayout,
  },
  {
    path: "/characters",
    name: "charactersList",
    component: () => import("src/routes/Characters"),
    layout: AppLayout,
  },
  {
    path: "/personas",
    name: "personasList",
    component: () => import("src/routes/Personas"),
    layout: AppLayout,
  },
  {
    path: "/prompts",
    name: "promptsList",
    component: () => import("src/routes/Prompts"),
    layout: AppLayout,
  },
  {
    path: "/flows",
    name: "flowsList",
    component: () => import("src/routes/Flows"),
    layout: AppLayout,
  },
  {
    path: "/chats",
    name: "chatsList",
    component: () => import("src/routes/Chats"),
    layout: AppLayout,
  },
  {
    path: "/chats/:chatId",
    name: "chat",
    component: () => import("src/routes/SingleChat"),
    layout: () => import("src/routes/SingleChat/SingleChatLayout"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("src/routes/Settings"),
    layout: AppLayout,
  },
  {
    path: "*",
    name: "notFound",
    component: () => import("src/routes/NotFound"),
    layout: AppLayout,
  },
] as const satisfies readonly RouteItem[];


