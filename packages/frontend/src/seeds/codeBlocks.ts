import { CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";
import { v4 as uuid } from "uuid";

export default [
  {
    "id": uuid(),
    "createdAt": new Date(),
    "name": "PROBIV with spaces",
    "content": "/** @type {PreHistoryFn} */\nfunction preHistory(params) {\n  params.messages.forEach(message => {\n    message.prompts.message.message = message.prompts.message.message.replace(/ /gm, \"⠀\");\n  });\n  return params;\n}\n\n/** @type {OnMessageFn} */\nfunction onMessage(params) {\n  params.message = params.message.replace(/⠀/g, \" \");\n  return params;\n}\n",
  },
  {
    "id": uuid(),
    "createdAt": new Date(),
    "name": "Trim history to summary",
    "content": "/** @type {PreHistoryFn} */\nfunction preHistory(params) {\n  params.messages = params.messages.slice(params.messages.findLastIndex(message => message.prompts.summary?.message) + 1);\n  return params;\n}\n",
  },
] satisfies CodeBlockStorageItem[];