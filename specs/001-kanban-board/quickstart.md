# Quickstart: Kanban Board Application

**Branch**: `001-kanban-board` | **Date**: 2026-02-20

## Prerequisites

- Go 1.23+
- Node.js 18+
- pnpm
- Wails CLI v2 (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

## Setup

```bash
# 1. 安裝 Go 依賴（含 SQLite）
go mod tidy

# 2. 安裝前端依賴（含 dnd-kit）
cd frontend && pnpm install && cd ..

# 3. 啟動開發模式（熱重載）
wails dev
```

## New Dependencies to Install

### Go (backend)

```bash
go get modernc.org/sqlite
go get github.com/google/uuid
```

> `google/uuid` 已在 go.mod 中（Wails 間接依賴），但建議直接引用。

### Frontend

```bash
cd frontend
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 資料持久化 | modernc.org/sqlite | 純 Go、跨平台、SQL 查詢 |
| 拖放互動 | @dnd-kit | 活躍維護、Kanban 支援完整 |
| 狀態管理 | useState + useContext | 專案規模不需額外狀態庫 |
| UI 元件 | shadcn/ui (已有) | 與 Tailwind v4 整合良好 |
| 前後端通訊 | Wails bindings | 原生 Go ↔ TS 呼叫，無需 REST |

## Development Workflow

```text
1. Go 端新增/修改 App struct 方法
2. wails dev 自動重新生成 frontend/wailsjs/go/main/App.ts
3. 前端 import 並呼叫新方法
4. 資料自動存入 SQLite（UserConfigDir/KanbanApp/data.db）
```

## File Structure (New Files)

```text
# Go backend
internal/
├── db/
│   ├── db.go             # SQLite 連線管理、初始化
│   └── migrations.go     # Schema 建立與版本管理
├── models/
│   ├── board.go          # Board struct & 方法
│   ├── column.go         # Column struct & 方法
│   └── card.go           # Card struct & 方法
└── seed/
    └── seed.go           # 首次啟動範例資料

app.go                    # 擴充 App struct，加入所有 binding 方法

# React frontend
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # 側邊欄（看板列表）
│   │   └── AppLayout.tsx     # 主要佈局
│   ├── board/
│   │   ├── BoardView.tsx     # 看板主視圖
│   │   ├── Column.tsx        # 欄位元件
│   │   ├── Card.tsx          # 卡片元件
│   │   ├── CardDetail.tsx    # 卡片詳情面板
│   │   ├── AddCard.tsx       # 新增卡片表單
│   │   └── AddColumn.tsx     # 新增欄位表單
│   └── common/
│       ├── ConfirmDialog.tsx  # 確認刪除對話框
│       └── SearchBar.tsx      # 搜尋欄
├── hooks/
│   ├── useBoard.ts           # 看板資料 hook
│   └── useDragAndDrop.ts     # 拖放邏輯 hook
├── context/
│   └── BoardContext.tsx       # 看板狀態 context
└── types/
    └── kanban.ts              # TypeScript 型別定義
```

## Build

```bash
# 開發模式
wails dev

# 正式建置
wails build

# 跨平台建置
./scripts/build-all.sh
```
