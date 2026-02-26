# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development (runs both backend and frontend concurrently)
yarn dev

# Build (compiles both packages)
yarn build

# Start production server (backend serves frontend static files)
yarn start

# Individual package commands
yarn dev:frontend    # Vite dev server on port 4500
yarn dev:backend     # Nodemon with tsx on port 4501
yarn build:frontend
yarn build:backend
```

## Architecture Overview

NoassTavern is an AI character chat application organized as a **Yarn v4 monorepo** with two packages:

### Backend (`packages/backend/`)
- **Fastify v5** web framework with TypeScript
- Modular structure in `src/modules/`:
  - `base/` - Health checks, basic endpoints
  - `proxy/` - HTTP proxy for CORS bypass, SOCKS5 support
  - `storage/` - REST API for 13 resource types (characters, chats, messages, prompts, flows, lore books, code blocks, etc.)
- File-based JSON persistence in root `storage/` directory
- Zod schema validation via `fastify-type-provider-zod`
- WebSocket support via `@fastify/websocket`

### Frontend (`packages/frontend/`)
- **React 18** with React Router 7
- **Vite** build tool
- **MobX** state management - stores in `src/store/` correspond to backend resources
- Monaco editor for code editing, Slate for rich text
- Key routes: `/characters`, `/chats/:chatId`, `/prompts`, `/settings`, `/assistant`

### Data Flow
1. Frontend MobX managers (`src/store/`) call API clients (`src/storages/`)
2. Backend storage modules (`modules/storage/`) handle CRUD operations
3. Data persists to JSON files in `/storage/` subdirectories

## Key Directories

```
packages/backend/src/
  modules/storage/     # Each resource has routes + storages + types
  ws/                  # WebSocket handlers
  server.ts            # Fastify setup

packages/frontend/src/
  components/          # React components
  routes/              # Page components by route
  store/               # MobX state managers
  storages/            # Backend API clients

storage/               # Persistent JSON data (gitignored)
```

## Environment

Default ports: Frontend 4500, Backend 4501. Configure via `FRONTEND_PORT`, `BACKEND_PORT`, `BACKEND_HOST`, `BACKEND_URL` env vars.
