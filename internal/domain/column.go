package domain

import (
	"context"
	"time"
)

// Column represents a workflow stage within a board (e.g. "待辦", "進行中", "完成").
//
// What: A named vertical lane that holds an ordered list of cards.
// Why: Columns visualize workflow stages so users can track card progression at a glance.
// When: Auto-created (3 defaults) with a new board; user can add, rename, reorder, or delete.
type Column struct {
	ID        string    `json:"id"`
	BoardID   string    `json:"board_id"`
	Title     string    `json:"title"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
}

// ColumnRepository defines persistence operations for columns.
type ColumnRepository interface {
	GetByBoardID(ctx context.Context, boardID string) ([]Column, error)
	GetByID(ctx context.Context, id string) (*Column, error)
	Create(ctx context.Context, col *Column) error
	CreateBatch(ctx context.Context, cols []Column) error
	Update(ctx context.Context, col *Column) error
	Delete(ctx context.Context, id string) error
	CountByBoardID(ctx context.Context, boardID string) (int, error)
	MaxPosition(ctx context.Context, boardID string) (int, error)
	UpdatePosition(ctx context.Context, id string, position int) error
}
