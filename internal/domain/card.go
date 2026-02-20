package domain

import (
	"context"
	"time"
)

// Card represents a task or work item within a column.
//
// What: A movable unit of work with title, description, priority, and optional due date.
// Why: Cards are the core interaction object — users create, edit, drag, and track them across columns.
// When: Created by the user inside a column; moved between columns via drag-and-drop; deleted explicitly.
type Card struct {
	ID          string     `json:"id"`
	ColumnID    string     `json:"column_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date"`
	Position    int        `json:"position"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// CardUpdate carries partial update fields for a card.
// Nil fields are left unchanged; this enables selective updates without overwriting unrelated data.
//
// What: A value object representing a partial update request (PATCH semantics).
// Why: Allows the frontend to update individual fields (e.g. only priority) without sending the full card.
// When: Sent from the CardDetail panel whenever the user edits a single field.
type CardUpdate struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Priority    *string `json:"priority"`
	DueDate     *string `json:"due_date"`
}

// CardRepository defines persistence operations for cards.
type CardRepository interface {
	GetByColumnID(ctx context.Context, columnID string) ([]Card, error)
	Create(ctx context.Context, card *Card) error
	Update(ctx context.Context, id string, updates CardUpdate) (*Card, error)
	Delete(ctx context.Context, id string) error
	Move(ctx context.Context, id, targetColumnID string, newPosition int) error
	MoveAllToColumn(ctx context.Context, fromColumnID, toColumnID string) error
	MaxPosition(ctx context.Context, columnID string) (int, error)
	Search(ctx context.Context, boardID, query string) ([]Card, error)
}
