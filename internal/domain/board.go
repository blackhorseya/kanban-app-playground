package domain

import (
	"context"
	"time"
)

// Board represents a Kanban board — the top-level container for columns and cards.
//
// What: A named workspace that groups related columns and cards together.
// Why: Users need isolated workspaces to manage different projects or workflows independently.
// When: Created explicitly by the user; deleted when the user removes it (cascades to columns and cards).
type Board struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BoardRepository defines persistence operations for boards.
type BoardRepository interface {
	GetAll(ctx context.Context) ([]Board, error)
	GetByID(ctx context.Context, id string) (*Board, error)
	Create(ctx context.Context, board *Board) error
	Update(ctx context.Context, board *Board) error
	Delete(ctx context.Context, id string) error
}
