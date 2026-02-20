# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development (hot reload)
wails dev

# Build for current platform
wails build

# Cross-platform builds
./scripts/build-all.sh           # All platforms
./scripts/build-macos-arm.sh     # macOS Apple Silicon
./scripts/build-macos-intel.sh   # macOS Intel
./scripts/build-windows.sh       # Windows
./scripts/build-linux.sh         # Linux

# Frontend only
cd frontend
pnpm install                     # Install dependencies
pnpm run lint                    # ESLint
pnpm run build                   # TypeScript check + Vite build

# Add shadcn/ui component
cd frontend && npx shadcn@latest add [component-name]
```

## Architecture

This is a **Wails v2** desktop application with Go backend and React frontend.

### Go ↔ Frontend Binding

1. Define methods on `App` struct in `app.go`
2. Bind the struct in `main.go` via `Bind: []interface{}{app}`
3. Wails generates TypeScript bindings in `frontend/wailsjs/go/main/`
4. Frontend imports and calls: `import { Greet } from "../wailsjs/go/main/App"`

The `//go:embed all:frontend/dist` directive embeds the built frontend into the Go binary.

### Frontend Stack

- React 18 + TypeScript 5.7 + Vite 5.4
- Tailwind CSS v4 (using `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- shadcn/ui components in `frontend/src/components/ui/`
- Path alias: `@/` maps to `frontend/src/`

### Key Files

- `app.go` - Backend logic exposed to frontend
- `main.go` - Wails application bootstrap
- `frontend/src/App.tsx` - Main React component
- `wails.json` - Project config (uses pnpm)

## Active Technologies
- Go 1.23 (backend) + TypeScript 5.7 / React 18 (frontend) + Wails v2.11.0, modernc.org/sqlite, @dnd-kit/core+sortable, shadcn/ui, Tailwind CSS v4 (001-kanban-board)
- SQLite (via modernc.org/sqlite, Pure Go, WAL mode) → `os.UserConfigDir()/KanbanApp/data.db` (001-kanban-board)

## Recent Changes
- 001-kanban-board: Added Go 1.23 (backend) + TypeScript 5.7 / React 18 (frontend) + Wails v2.11.0, modernc.org/sqlite, @dnd-kit/core+sortable, shadcn/ui, Tailwind CSS v4
