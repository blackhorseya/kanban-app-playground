# Kanban Board

A cross-platform desktop Kanban board application built with Go and React.

## Tech Stack

- **Backend**: Go + [Wails v2](https://wails.io/) + SQLite (modernc.org/sqlite)
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **DI**: Google Wire (compile-time dependency injection)

## Features

- Multiple boards with sidebar navigation
- Columns with drag-and-drop reordering
- Cards with title, description, priority (low/medium/high), and optional due date
- Drag-and-drop cards between columns
- Card search and priority filtering
- Automatic sample data seeding on first launch

## Development

```bash
# Prerequisites: Go 1.23+, Node.js, pnpm, Wails CLI
wails dev
```

The frontend dev server runs on http://localhost:5173 with Vite HMR.

## Building

```bash
# Current platform
wails build

# Cross-platform
./scripts/build-all.sh
./scripts/build-macos-arm.sh     # macOS Apple Silicon
./scripts/build-macos-intel.sh   # macOS Intel
./scripts/build-windows.sh       # Windows
./scripts/build-linux.sh         # Linux
```

Built applications output to `build/bin/`.

## Architecture

Clean Architecture with 4 layers:

```
internal/
├── domain/          # Entities + Repository interfaces
├── application/     # Business logic services + DTOs
├── adapter/         # Wails binding handler
└── infrastructure/
    └── sqlite/      # Repository implementations + migrations
```

Data is stored in SQLite at `os.UserConfigDir()/KanbanApp/data.db` (WAL mode).

## Adding shadcn/ui Components

```bash
cd frontend && npx shadcn@latest add [component-name]
```
