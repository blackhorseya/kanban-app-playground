# Research: Kanban Board Application

**Branch**: `001-kanban-board` | **Date**: 2026-02-20

## R1: 拖放函式庫選擇

**Decision**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`

**Rationale**:
- 2025/2026 年最活躍維護的 React 拖放函式庫（`@dnd-kit/react` 0.3.2 仍在更新）
- 完整支援同欄內排序 + 跨欄移動（Kanban 核心需求）
- 有現成的 `@dnd-kit + Tailwind + shadcn/ui` Kanban 範例專案作為參考
- 支援觸控裝置和無障礙功能

**Alternatives considered**:
- `react-beautiful-dnd`: 2022 年已棄置，不支援 React 18，**排除**
- `@hello-pangea/dnd`: 社群 fork，API 簡單但長期維護不如 @dnd-kit，**次選**

## R2: 資料持久化方案

**Decision**: `modernc.org/sqlite`（Pure Go SQLite）

**Rationale**:
- **純 Go 實作，無需 CGO**，跨平台建置（macOS/Windows/Linux）零問題
- 階層式資料模型（boards → columns → cards）天然適合關聯式表達
- 未來擴充搜尋/篩選/標籤等功能時，SQL 查詢直接支援
- 單一 `.db` 檔案，配合 WAL 模式確保崩潰安全性
- 效能對 < 1000 筆資料完全充足

**Alternatives considered**:
- `mattn/go-sqlite3`: CGO 依賴會破壞跨平台建置流程，**排除**
- `bbolt`: Key-value 模型對階層資料不自然，失去查詢能力，**排除**
- JSON 檔案: 最簡單但無查詢能力、整檔讀寫、資料損壞風險，**作為降級方案**

## R3: 前端狀態管理

**Decision**: React `useState` + `useContext` + Wails bindings

**Rationale**:
- 專案規模不大，不需要 Redux/Zustand 等額外狀態管理庫
- Wails binding 呼叫即為資料來源，前端主要管理 UI 狀態
- 看板資料從 Go 端取得，修改後立即回寫 Go 端
- useContext 用於跨元件共享當前看板狀態

**Alternatives considered**:
- Zustand: 輕量但對此規模不必要，增加額外依賴
- Redux Toolkit: 過重

## R4: 資料儲存位置

**Decision**: `os.UserConfigDir()` + 應用專用子目錄

**Rationale**:
- macOS: `~/Library/Application Support/KanbanApp/`
- Windows: `%AppData%/KanbanApp/`
- Linux: `~/.config/KanbanApp/`
- 符合各平台慣例，使用者可自行備份

## R5: 欄位拖曳排序演算法

**Decision**: 使用 fractional indexing（分數索引）進行排序

**Rationale**:
- 拖放重新排序時只需更新被移動項目的 `position` 值
- 避免每次移動都要更新所有卡片的排序欄位
- 當精度不足時進行批次重新編號（rebalance）
- 簡單實作：使用整數 position，每次插入取中間值
