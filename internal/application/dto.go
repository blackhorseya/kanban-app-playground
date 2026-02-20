package application

import "kanban-app-playground/internal/domain"

// BoardData is the query response for a full board with columns and cards.
type BoardData struct {
	Board   domain.Board     `json:"board"`
	Columns []ColumnWithCards `json:"columns"`
}

// ColumnWithCards pairs a column with its cards for API responses.
type ColumnWithCards struct {
	Column domain.Column `json:"column"`
	Cards  []domain.Card `json:"cards"`
}
