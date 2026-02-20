export interface Board {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Card {
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

export interface CardUpdate {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
}

export interface ColumnWithCards {
  column: Column;
  cards: Card[];
}

export interface BoardData {
  board: Board;
  columns: ColumnWithCards[];
}
