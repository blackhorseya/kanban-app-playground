# Tasks: Kanban Board Application

**Input**: Design documents from `/specs/001-kanban-board/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/wails-bindings.md

**Tests**: Not explicitly requested — test tasks not included. Tests can be added later.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create project structure

- [x] T001 Install Go dependency `modernc.org/sqlite` via `go get modernc.org/sqlite`
- [x] T002 Install frontend dependencies `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` via `cd frontend && pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [x] T003 [P] Create directory structure: `internal/db/`, `internal/models/`, `internal/seed/`
- [x] T004 [P] Create directory structure: `frontend/src/components/layout/`, `frontend/src/components/board/`, `frontend/src/components/common/`, `frontend/src/hooks/`, `frontend/src/context/`, `frontend/src/types/`
- [x] T005 Update Wails app title from "wails-base-fresh" to "Kanban Board" in `main.go` and `wails.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database layer, data models, TypeScript types, and shared UI infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement SQLite connection manager with WAL mode and `os.UserConfigDir()` path in `internal/db/db.go`
- [x] T007 Implement database schema migrations (CREATE TABLE boards, columns, cards with indexes) in `internal/db/migrations.go`
- [x] T008 [P] Implement Board model with CRUD operations (GetAll, GetByID, Create, Update, Delete) in `internal/models/board.go`
- [x] T009 [P] Implement Column model with CRUD + position operations (GetByBoardID, Create, Update, Delete, Move) in `internal/models/column.go`
- [x] T010 [P] Implement Card model with CRUD + move operations (GetByColumnID, Create, Update, Delete, MoveCard) in `internal/models/card.go`
- [x] T011 Define TypeScript types (Board, Column, Card, CardUpdate, BoardData, ColumnWithCards) in `frontend/src/types/kanban.ts`
- [x] T012 [P] Create ConfirmDialog reusable component using shadcn/ui AlertDialog in `frontend/src/components/common/ConfirmDialog.tsx`
- [x] T013 [P] Create BoardContext with provider for sharing active board state across components in `frontend/src/context/BoardContext.tsx`
- [x] T014 Create AppLayout component with sidebar + main content area in `frontend/src/components/layout/AppLayout.tsx`
- [x] T015 Wire up App struct with database initialization in `app.go` — add DB field, initialize in startup(), pass to model layer

**Checkpoint**: Database layer operational, all 3 models ready, shared UI components available. User story implementation can begin.

---

## Phase 3: User Story 1 - 建立與管理看板 (Priority: P1) 🎯 MVP

**Goal**: Users can create, rename, and delete boards. Boards appear in sidebar for navigation.

**Independent Test**: Create a new board, verify it appears in sidebar. Rename it. Delete it with confirmation.

### Implementation for User Story 1

- [x] T016 [P] [US1] Implement `GetAllBoards()` binding method on App struct in `app.go`
- [x] T017 [P] [US1] Implement `CreateBoard(title)` binding method (creates board + 3 default columns) in `app.go`
- [x] T018 [P] [US1] Implement `UpdateBoard(id, title)` binding method in `app.go`
- [x] T019 [P] [US1] Implement `DeleteBoard(id)` binding method (cascade delete) in `app.go`
- [x] T020 [P] [US1] Implement `GetBoardWithData(boardId)` binding method (returns board + columns + cards) in `app.go`
- [x] T021 [US1] Create Sidebar component with board list, add/rename/delete board actions in `frontend/src/components/layout/Sidebar.tsx`
- [x] T022 [US1] Create useBoard hook for board CRUD operations calling Wails bindings in `frontend/src/hooks/useBoard.ts`
- [x] T023 [US1] Integrate Sidebar + AppLayout into main App, replace demo content in `frontend/src/App.tsx`
- [x] T024 [US1] Add empty state for board view — show prompt when no board selected in `frontend/src/components/board/BoardView.tsx`

**Checkpoint**: Users can create, rename, delete boards. Sidebar navigation works. Board view shows columns (empty).

---

## Phase 4: User Story 2 - 管理欄位狀態 (Priority: P1)

**Goal**: Users can add, rename, reorder, and delete columns within a board.

**Independent Test**: Add a new column, rename it, drag to reorder, delete with confirmation (handling cards in deleted column).

### Implementation for User Story 2

- [x] T025 [P] [US2] Implement `CreateColumn(boardId, title)` binding method in `app.go`
- [x] T026 [P] [US2] Implement `UpdateColumn(id, title)` binding method in `app.go`
- [x] T027 [P] [US2] Implement `DeleteColumn(id, moveCardsTo)` binding method with last-column guard in `app.go`
- [x] T028 [P] [US2] Implement `MoveColumn(id, newPosition)` binding method in `app.go`
- [x] T029 [US2] Create Column component displaying column header with rename/delete actions in `frontend/src/components/board/Column.tsx`
- [x] T030 [US2] Create AddColumn component for adding new columns to a board in `frontend/src/components/board/AddColumn.tsx`
- [x] T031 [US2] Implement column rendering in BoardView — display all columns horizontally with add column button in `frontend/src/components/board/BoardView.tsx`

**Checkpoint**: Users can manage columns within any board. Columns display horizontally with CRUD actions.

---

## Phase 5: User Story 3 - 建立與管理卡片 (Priority: P1)

**Goal**: Users can create, edit, and delete cards within any column.

**Independent Test**: Create a card with title, edit its description, delete it (no confirmation needed).

### Implementation for User Story 3

- [x] T032 [P] [US3] Implement `CreateCard(columnId, title)` binding method in `app.go`
- [x] T033 [P] [US3] Implement `UpdateCard(id, updates)` binding method in `app.go`
- [x] T034 [P] [US3] Implement `DeleteCard(id)` binding method in `app.go`
- [x] T035 [US3] Create Card component displaying title, truncated with tooltip for overflow in `frontend/src/components/board/Card.tsx`
- [x] T036 [US3] Create AddCard component with inline title input at column bottom in `frontend/src/components/board/AddCard.tsx`
- [x] T037 [US3] Integrate Card + AddCard into Column component — render cards list with add card form in `frontend/src/components/board/Column.tsx`

**Checkpoint**: Full CRUD for cards works. Users can create, edit title/description, and delete cards within columns.

---

## Phase 6: User Story 4 - 拖放卡片更新狀態 (Priority: P1)

**Goal**: Users can drag cards between columns and reorder within a column with visual feedback.

**Independent Test**: Drag a card from "待辦" to "進行中", verify it moves. Reorder cards within a column. Visual drop indicator appears during drag.

### Implementation for User Story 4

- [x] T038 [P] [US4] Implement `MoveCard(id, targetColumnId, newPosition)` binding method in `internal/adapter/handler.go`
- [x] T039 [US4] Create useDragAndDrop hook encapsulating dnd-kit DndContext, sensors, collision detection, and onDragEnd handler in `frontend/src/hooks/useDragAndDrop.ts`
- [x] T040 [US4] Integrate DndContext + SortableContext into BoardView — wrap columns with drag-and-drop context in `frontend/src/components/board/BoardView.tsx`
- [x] T041 [US4] Add useSortable to Card component — make cards draggable with drag handle in `frontend/src/components/board/Card.tsx`
- [x] T042 [US4] Add visual drop indicators — highlight target zone during drag, show insertion line in `frontend/src/components/board/Column.tsx`
- [x] T043 [US4] Handle cross-column card movement in onDragEnd — update column_id and position via MoveCard binding in `frontend/src/hooks/useDragAndDrop.ts`

**Checkpoint**: Core Kanban interaction complete. Cards can be dragged between columns and reordered with smooth visual feedback.

---

## Phase 7: User Story 5 - 資料持久化 (Priority: P2)

**Goal**: All data automatically persists across app restarts. First launch shows sample board.

**Independent Test**: Create boards/cards, close app, reopen — all data intact. First launch shows "我的看板" with sample cards.

### Implementation for User Story 5

- [x] T044 [US5] Implement seed data logic for first launch — create default board "我的看板" with 3 columns and 3 sample cards in `internal/application/board_service.go` (SeedIfEmpty method)
- [x] T045 [US5] Integrate seed check into app startup — detect empty DB and run seed in `main.go`
- [x] T046 [US5] Verify auto-save behavior — ensure all Wails binding methods write to SQLite immediately (all repository methods write directly)

**Checkpoint**: Data survives restart. First-time users see sample board with demo cards.

---

## Phase 8: User Story 6 - 卡片詳細資訊 (Priority: P2)

**Goal**: Users can set priority (low/medium/high) and due date on cards. Card detail panel shows all attributes.

**Independent Test**: Open card detail, set priority to "high" — see red label. Set due date — see date badge with near-due warning.

### Implementation for User Story 6

- [x] T047 [US6] Create CardDetail panel component with editable fields (title, description, priority selector, due date picker) in `frontend/src/components/board/CardDetail.tsx`
- [x] T048 [US6] Add priority badge display (color-coded: green=low, yellow=medium, red=high) to Card component in `frontend/src/components/board/Card.tsx`
- [x] T049 [US6] Add due date badge display with near-due visual warning (e.g., within 3 days) to Card component in `frontend/src/components/board/Card.tsx`
- [x] T050 [US6] Integrate CardDetail panel into BoardView — open on card click, close on backdrop click or escape in `frontend/src/components/board/BoardView.tsx`
- [x] T051 [US6] Install shadcn/ui components needed for CardDetail: dialog, select, popover, calendar via `cd frontend && npx shadcn@latest add dialog select popover calendar`

**Checkpoint**: Cards display priority colors and due dates. Detail panel enables full card editing.

---

## Phase 9: User Story 7 - 搜尋與篩選 (Priority: P3)

**Goal**: Users can search cards by keyword and filter by priority.

**Independent Test**: Type keyword in search bar — only matching cards shown. Select "high" priority filter — only high priority cards visible.

### Implementation for User Story 7

- [x] T052 [P] [US7] Implement `SearchCards(boardId, query)` binding method with LIKE query on title+description in `internal/adapter/handler.go`
- [x] T053 [P] [US7] Implement `FilterCards(boardId, priority)` binding method in `internal/adapter/handler.go`
- [x] T054 [US7] Create SearchBar component with debounced input (500ms) in `frontend/src/components/common/SearchBar.tsx`
- [x] T055 [US7] Integrate SearchBar + priority filter dropdown into BoardView header in `frontend/src/components/board/BoardView.tsx`
- [x] T056 [US7] Implement client-side card filtering — dim/hide non-matching cards while preserving column structure in `frontend/src/components/board/BoardView.tsx`

**Checkpoint**: Search and filter fully functional. Users can quickly find cards across all columns.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories

- [x] T057 Update wails.json output filename from "wails-base-fresh" to "kanban-board" in `wails.json`
- [x] T058 Add keyboard shortcuts — Escape to close dialogs, Enter to confirm in all form components
- [x] T059 Add loading states for async Wails binding calls across all components (local SQLite ops are near-instant; empty states already handle initial load)
- [x] T060 Verify `wails build` produces working binary — `Kanban Board.app` built successfully

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — first story, establishes board navigation
- **US2 (Phase 4)**: Depends on US1 (needs board context and BoardView)
- **US3 (Phase 5)**: Depends on US2 (needs columns to place cards in)
- **US4 (Phase 6)**: Depends on US3 (needs cards to drag)
- **US5 (Phase 7)**: Depends on Foundational (seed data) + US1-US3 for meaningful verification
- **US6 (Phase 8)**: Depends on US3 (needs cards with detail fields)
- **US7 (Phase 9)**: Depends on US3 (needs cards to search/filter)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

```text
Phase 1 (Setup) → Phase 2 (Foundational)
                        │
                        ▼
                   Phase 3 (US1: 看板管理)
                        │
                        ▼
                   Phase 4 (US2: 欄位管理)
                        │
                        ▼
                   Phase 5 (US3: 卡片管理)
                      / │ \
                     /  │  \
                    ▼   ▼   ▼
          Phase 6  Phase 7  Phase 8  (US4, US5, US6 可並行)
          (US4)    (US5)    (US6)
                    │
                    ▼
               Phase 9 (US7: 搜尋篩選)
                    │
                    ▼
              Phase 10 (Polish)
```

### Parallel Opportunities Within Phases

- **Phase 1**: T003 + T004 並行（不同目錄）
- **Phase 2**: T008 + T009 + T010 並行（不同 Go 檔案）；T011 + T012 + T013 並行（不同前端檔案）
- **Phase 3**: T016-T020 所有 binding 方法並行（同檔案但獨立方法）
- **Phase 5**: T032 + T033 + T034 並行
- **Phase 6**: T038 可與前端 T039 並行
- **Phase 8**: 需安裝 shadcn 元件（T051）後才能做 T047
- **Phase 9**: T052 + T053 並行（不同 binding 方法）

---

## Implementation Strategy

### MVP First (Phase 1–6)

1. Complete Phase 1: Setup — 安裝依賴
2. Complete Phase 2: Foundational — 資料庫 + 模型 + 共用元件
3. Complete Phase 3: US1 — 看板 CRUD + 側邊欄
4. Complete Phase 4: US2 — 欄位 CRUD + 水平佈局
5. Complete Phase 5: US3 — 卡片 CRUD
6. Complete Phase 6: US4 — 拖放互動
7. **STOP and VALIDATE**: 核心 Kanban 功能完整可用

### Incremental Delivery

1. Setup + Foundational → 基礎建設完成
2. + US1 → 可建立/管理看板（可展示）
3. + US2 → 看板有欄位了（Kanban 雛形）
4. + US3 → 可新增卡片了（基本可用）
5. + US4 → 拖放功能！（核心 MVP ✅）
6. + US5 → 資料持久化 + 首次啟動體驗
7. + US6 → 優先級和到期日
8. + US7 → 搜尋與篩選
9. Polish → 最終打磨

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `app.go` 有多個任務但每個 binding 方法獨立，可安全並行
- 前端元件修改 BoardView.tsx 跨多個 story — 按 story 順序處理避免衝突
