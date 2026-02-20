# Implementation Plan: Kanban Board Application

**Branch**: `001-kanban-board` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-kanban-board/spec.md`

## Summary

建立一個類似 Jira 的 Kanban 看板桌面應用程式，使用 Wails v2（Go 後端 + React 前端）。核心功能包括：看板/欄位/卡片的 CRUD、拖放排序與跨欄移動、本機 SQLite 資料持久化、卡片優先級與到期日管理、搜尋與篩選。

## Technical Context

**Language/Version**: Go 1.23 (backend) + TypeScript 5.7 / React 18 (frontend)
**Primary Dependencies**: Wails v2.11.0, modernc.org/sqlite, @dnd-kit/core+sortable, shadcn/ui, Tailwind CSS v4
**Storage**: SQLite (via modernc.org/sqlite, Pure Go, WAL mode) → `os.UserConfigDir()/KanbanApp/data.db`
**Testing**: `go test` (backend), ESLint + TypeScript strict (frontend)
**Target Platform**: macOS (arm64/amd64), Windows (amd64), Linux (amd64) — Wails desktop
**Project Type**: Desktop application (Go backend + Web frontend)
**Performance Goals**: 拖放 < 500ms 視覺更新、啟動 < 3s、100+ 卡片流暢操作
**Constraints**: 無 CGO（跨平台建置需求）、單一使用者、本機儲存
**Scale/Scope**: 單一使用者，每看板 < 1000 卡片，看板數無上限

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution 尚未設定具體原則（使用模板預設值），無特定 gate 限制。以下為基於專案特性的自我檢查：

- [x] 無外部服務依賴（單機應用）
- [x] 無 CGO 依賴（使用 modernc.org/sqlite）
- [x] 跨平台建置不受影響
- [x] 資料模型簡潔（3 個實體）
- [x] 無過度工程（不引入不必要的框架）

## Project Structure

### Documentation (this feature)

```text
specs/001-kanban-board/
├── plan.md              # This file
├── research.md          # Phase 0 output — 技術選型決策
├── data-model.md        # Phase 1 output — 資料模型設計
├── quickstart.md        # Phase 1 output — 開發快速入門
├── contracts/
│   └── wails-bindings.md # Phase 1 output — Go ↔ TS API 合約
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# Go backend
internal/
├── db/
│   ├── db.go                 # SQLite 連線、初始化、WAL 設定
│   └── migrations.go         # Schema DDL 與版本管理
├── models/
│   ├── board.go              # Board CRUD 操作
│   ├── column.go             # Column CRUD + 排序操作
│   └── card.go               # Card CRUD + 移動/搜尋操作
└── seed/
    └── seed.go               # 首次啟動範例資料

app.go                        # 擴充：加入所有 Wails binding 方法

# React frontend
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # 側邊欄看板列表
│   │   └── AppLayout.tsx     # 主佈局（側邊欄 + 看板區）
│   ├── board/
│   │   ├── BoardView.tsx     # 看板主視圖（欄位容器 + DndContext）
│   │   ├── Column.tsx        # 欄位元件（SortableContext）
│   │   ├── Card.tsx          # 卡片元件（useSortable）
│   │   ├── CardDetail.tsx    # 卡片詳情面板
│   │   ├── AddCard.tsx       # 新增卡片表單
│   │   └── AddColumn.tsx     # 新增欄位表單
│   └── common/
│       ├── ConfirmDialog.tsx  # 確認刪除對話框
│       └── SearchBar.tsx      # 搜尋欄
├── hooks/
│   ├── useBoard.ts           # 看板資料載入/操作 hook
│   └── useDragAndDrop.ts     # dnd-kit 邏輯封裝
├── context/
│   └── BoardContext.tsx       # 看板狀態 context
└── types/
    └── kanban.ts              # TypeScript 型別定義
```

**Structure Decision**: 採用 Wails 原有結構，Go 後端邏輯放 `internal/` 目錄下，`app.go` 作為 binding 層。前端在 `frontend/src/` 下按功能組織元件。

## Complexity Tracking

> 無 Constitution 違規需要 justify。技術選型均為最簡方案：
> - SQLite 而非分散式 DB
> - useState/useContext 而非 Redux
> - @dnd-kit 而非自行實作拖放
