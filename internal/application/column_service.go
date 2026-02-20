package application

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"kanban-app-playground/internal/domain"
)

type ColumnService struct {
	columns domain.ColumnRepository
	cards   domain.CardRepository
}

func NewColumnService(columns domain.ColumnRepository, cards domain.CardRepository) *ColumnService {
	return &ColumnService{columns: columns, cards: cards}
}

func (s *ColumnService) Create(ctx context.Context, boardID, title string) (*domain.Column, error) {
	if title == "" {
		return nil, fmt.Errorf("%w: column title cannot be empty", domain.ErrValidation)
	}

	maxPos, err := s.columns.MaxPosition(ctx, boardID)
	if err != nil {
		return nil, err
	}

	col := &domain.Column{
		ID:        uuid.New().String(),
		BoardID:   boardID,
		Title:     title,
		Position:  maxPos + 1000,
		CreatedAt: time.Now().UTC(),
	}

	if err := s.columns.Create(ctx, col); err != nil {
		return nil, err
	}
	return col, nil
}

func (s *ColumnService) Update(ctx context.Context, id, title string) (*domain.Column, error) {
	if title == "" {
		return nil, fmt.Errorf("%w: column title cannot be empty", domain.ErrValidation)
	}

	col, err := s.columns.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	col.Title = title
	if err := s.columns.Update(ctx, col); err != nil {
		return nil, err
	}
	return col, nil
}

// Delete removes a column. If moveCardsTo is non-empty, cards are moved first.
// Returns ErrLastColumn if it's the only column in the board.
func (s *ColumnService) Delete(ctx context.Context, id, moveCardsTo string) error {
	col, err := s.columns.GetByID(ctx, id)
	if err != nil {
		return err
	}

	count, err := s.columns.CountByBoardID(ctx, col.BoardID)
	if err != nil {
		return err
	}
	if count <= 1 {
		return domain.ErrLastColumn
	}

	if moveCardsTo != "" {
		if err := s.cards.MoveAllToColumn(ctx, id, moveCardsTo); err != nil {
			return fmt.Errorf("move cards: %w", err)
		}
	}

	return s.columns.Delete(ctx, id)
}

func (s *ColumnService) Move(ctx context.Context, id string, newPosition int) error {
	return s.columns.UpdatePosition(ctx, id, newPosition)
}
