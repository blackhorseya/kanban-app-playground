package application

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"kanban-app-playground/internal/domain"
)

type CardService struct {
	cards   domain.CardRepository
	columns domain.ColumnRepository
}

func NewCardService(cards domain.CardRepository, columns domain.ColumnRepository) *CardService {
	return &CardService{cards: cards, columns: columns}
}

func (s *CardService) Create(ctx context.Context, columnID, title string) (*domain.Card, error) {
	if title == "" {
		return nil, fmt.Errorf("%w: card title cannot be empty", domain.ErrValidation)
	}

	if _, err := s.columns.GetByID(ctx, columnID); err != nil {
		return nil, fmt.Errorf("column not found: %w", err)
	}

	maxPos, err := s.cards.MaxPosition(ctx, columnID)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	card := &domain.Card{
		ID:        uuid.New().String(),
		ColumnID:  columnID,
		Title:     title,
		Priority:  "medium",
		Position:  maxPos + 1000,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.cards.Create(ctx, card); err != nil {
		return nil, err
	}
	return card, nil
}

func (s *CardService) Update(ctx context.Context, id string, updates domain.CardUpdate) (*domain.Card, error) {
	if updates.Title != nil && *updates.Title == "" {
		return nil, fmt.Errorf("%w: card title cannot be empty", domain.ErrValidation)
	}
	return s.cards.Update(ctx, id, updates)
}

func (s *CardService) Delete(ctx context.Context, id string) error {
	return s.cards.Delete(ctx, id)
}

func (s *CardService) Move(ctx context.Context, id, targetColumnID string, newPosition int) error {
	return s.cards.Move(ctx, id, targetColumnID, newPosition)
}

func (s *CardService) Search(ctx context.Context, boardID, query string) ([]domain.Card, error) {
	return s.cards.Search(ctx, boardID, query)
}
