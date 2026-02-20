# Data Model: Kanban Board Application

**Branch**: `001-kanban-board` | **Date**: 2026-02-20

## Entity Relationship

```
Board 1──* Column 1──* Card
```

## Entities

### Board（看板）

| Field      | Type     | Constraints          | Description      |
|------------|----------|----------------------|------------------|
| id         | TEXT     | PK, UUID             | 唯一識別碼       |
| title      | TEXT     | NOT NULL, non-empty  | 看板名稱         |
| created_at | DATETIME | NOT NULL, auto       | 建立時間         |
| updated_at | DATETIME | NOT NULL, auto       | 最後更新時間     |

**Validation rules**:
- title 不可為空白字串
- 無數量上限

### Column（欄位）

| Field      | Type     | Constraints              | Description      |
|------------|----------|--------------------------|------------------|
| id         | TEXT     | PK, UUID                 | 唯一識別碼       |
| board_id   | TEXT     | FK → Board.id, NOT NULL  | 所屬看板         |
| title      | TEXT     | NOT NULL, non-empty      | 欄位名稱         |
| position   | INTEGER  | NOT NULL                 | 排序位置         |
| created_at | DATETIME | NOT NULL, auto           | 建立時間         |

**Validation rules**:
- title 不可為空白字串
- 每個看板至少需保留一個欄位（刪除時檢查）
- position 在同一 board 內唯一
- 刪除時級聯：需確認對話框

### Card（卡片）

| Field       | Type     | Constraints               | Description                |
|-------------|----------|---------------------------|----------------------------|
| id          | TEXT     | PK, UUID                  | 唯一識別碼                 |
| column_id   | TEXT     | FK → Column.id, NOT NULL  | 所屬欄位                   |
| title       | TEXT     | NOT NULL, non-empty       | 卡片標題                   |
| description | TEXT     | nullable                  | 卡片描述                   |
| priority    | TEXT     | CHECK(low/medium/high)    | 優先級（低/中/高）         |
| due_date    | TEXT     | nullable, ISO 8601 date   | 到期日                     |
| position    | INTEGER  | NOT NULL                  | 在欄位中的排序位置         |
| created_at  | DATETIME | NOT NULL, auto            | 建立時間                   |
| updated_at  | DATETIME | NOT NULL, auto            | 最後更新時間               |

**Validation rules**:
- title 不可為空白字串
- priority 只接受 "low"、"medium"、"high"
- due_date 格式為 ISO 8601（YYYY-MM-DD）或 null
- position 在同一 column 內唯一

## State Transitions

### Card 跨欄移動

```
Column A (position: N) → Column B (position: M)
```

- 更新 card.column_id = B.id
- 更新 card.position = 目標位置
- 不需狀態機：欄位名稱即為狀態，由使用者自訂

## Default Data（首次啟動）

首次啟動時建立：

**Board**: "我的看板"

**Columns** (按 position 排序):
1. "待辦" (position: 1000)
2. "進行中" (position: 2000)
3. "完成" (position: 3000)

**Cards** (示範卡片):
- "待辦" 欄：
  - "歡迎使用看板！" (priority: medium) — 描述："這是一張示範卡片，你可以拖曳它到其他欄位"
  - "試試建立新卡片" (priority: low)
- "進行中" 欄：
  - "探索看板功能" (priority: high)

## SQL Schema

```sql
CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TEXT,
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_column_id ON cards(column_id);
```
