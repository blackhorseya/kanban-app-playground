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

# Regenerate Wire DI (after changing wire.go or providers)
go generate ./...
```

## Architecture

**Wails v2** desktop app: Go backend + React frontend, compiled into a single binary.

### Backend (Clean Architecture + Wire DI)

```
internal/
├── domain/          # Entities (Board, Column, Card) + Repository interfaces
├── application/     # Use-case services (BoardService, ColumnService, CardService) + DTOs
├── adapter/         # Handler — Wails binding struct, all exported methods → frontend TS functions
└── infrastructure/
    └── sqlite/      # Repository implementations, DB init (WAL mode), migrations
```

**Dependency flow**: `adapter → application → domain ← infrastructure/sqlite`

- **Domain** defines entities and repository interfaces (pure Go, no dependencies)
- **Application** implements business logic via services that depend on repository interfaces
- **Adapter** contains `Handler` — the single Wails-bound struct; all exported methods become frontend-callable
- **Infrastructure** implements repositories against SQLite (modernc.org/sqlite, pure Go)

**Wire DI** (`wire.go` / `wire_gen.go`): Uses Google Wire for compile-time dependency injection. Each layer exports a `wire.NewSet(...)`. The root `InitializeHandler()` in `wire.go` wires everything together. After changing providers, run `go generate ./...`.

### Go ↔ Frontend Binding

1. Define/modify exported methods on `Handler` struct in `internal/adapter/handler.go`
2. `Handler` is bound in `main.go` via `Bind: []interface{}{handler}`
3. Wails auto-generates TypeScript bindings in `frontend/wailsjs/go/adapter/`
4. Frontend imports: `import { MethodName } from "../../wailsjs/go/adapter/Handler"`
5. Models: `import { domain, application } from "../../wailsjs/go/models"`

The `//go:embed all:frontend/dist` directive in `main.go` embeds the built frontend into the Go binary.

### Frontend Stack

- React 19 + TypeScript + Vite (pnpm)
- Tailwind CSS v4 (using `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- shadcn/ui components in `frontend/src/components/ui/`
- @dnd-kit/core + @dnd-kit/sortable for drag-and-drop
- Path alias: `@/` maps to `frontend/src/`

### Frontend State Management

- `BoardContext` + `BoardProvider` — React Context for global board state (boards list, active board, refresh trigger)
- `useBoard` hook — wraps Wails Go calls (CRUD boards) with context state updates
- `useDragAndDrop` hook — encapsulates @dnd-kit drag logic for cards and columns
- Component data flow: `App → BoardProvider → AppLayout (Sidebar + BoardView) → Column → Card`

### Data Storage

SQLite via modernc.org/sqlite (pure Go, no CGO). WAL mode + foreign keys enabled.
- DB location: `os.UserConfigDir()/KanbanApp/data.db`
- Schema migrations run on startup (`internal/infrastructure/sqlite/migrations.go`)
- Cascade deletes: Board → Columns → Cards
- First launch seeds sample data via `SeedIfEmpty()`

### Feature Specs

Feature specifications live in `specs/` (e.g. `specs/001-kanban-board/`). Each spec folder contains planning docs (`spec.md`, `plan.md`, `tasks.md`, `data-model.md`) used during development.
