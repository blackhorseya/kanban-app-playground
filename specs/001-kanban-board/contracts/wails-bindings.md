# API Contracts: Wails Go ↔ Frontend Bindings

**Branch**: `001-kanban-board` | **Date**: 2026-02-20

> 此專案使用 Wails v2 binding 模式，Go 方法直接暴露給前端 TypeScript 呼叫。
> 無需 REST API — Wails 自動生成 TypeScript bindings。

## Board Methods

### `GetAllBoards() → Board[]`
取得所有看板列表（用於側邊欄）。

### `CreateBoard(title: string) → Board`
建立新看板，自動附帶三個預設欄位（待辦、進行中、完成）。
- **Error**: title 為空時回傳錯誤

### `UpdateBoard(id: string, title: string) → Board`
更新看板名稱。
- **Error**: id 不存在或 title 為空時回傳錯誤

### `DeleteBoard(id: string) → void`
刪除看板及其所有欄位和卡片（級聯刪除）。
- 前端需先顯示確認對話框

### `GetBoardWithData(boardId: string) → BoardData`
取得看板完整資料（含所有欄位和卡片），一次載入。

## Column Methods

### `CreateColumn(boardId: string, title: string) → Column`
在看板末尾建立新欄位。
- **Error**: boardId 不存在或 title 為空時回傳錯誤

### `UpdateColumn(id: string, title: string) → Column`
更新欄位名稱。

### `DeleteColumn(id: string, moveCardsTo: string?) → void`
刪除欄位。若有卡片且提供 moveCardsTo 則移動卡片；否則一併刪除。
- **Error**: 若為看板最後一個欄位，回傳錯誤
- 前端需先顯示確認對話框

### `MoveColumn(id: string, newPosition: int) → void`
移動欄位到新位置（拖曳欄位排序）。

## Card Methods

### `CreateCard(columnId: string, title: string) → Card`
在欄位底部建立新卡片。
- **Error**: columnId 不存在或 title 為空時回傳錯誤

### `UpdateCard(id: string, updates: CardUpdate) → Card`
更新卡片屬性（標題、描述、優先級、到期日）。

### `DeleteCard(id: string) → void`
刪除卡片（無需確認）。

### `MoveCard(id: string, targetColumnId: string, newPosition: int) → void`
移動卡片到目標欄位的指定位置（拖放操作）。

## Search Methods

### `SearchCards(boardId: string, query: string) → Card[]`
在看板內搜尋卡片（標題和描述模糊匹配）。

### `FilterCards(boardId: string, priority: string?) → BoardData`
按優先級篩選看板卡片。

## TypeScript Types

```typescript
interface Board {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

interface CardUpdate {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
}

interface BoardData {
  board: Board;
  columns: ColumnWithCards[];
}

interface ColumnWithCards {
  column: Column;
  cards: Card[];
}
```
