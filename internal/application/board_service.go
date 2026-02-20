package application

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"kanban-app-playground/internal/domain"
)

type BoardService struct {
	boards  domain.BoardRepository
	columns domain.ColumnRepository
	cards   domain.CardRepository
}

func NewBoardService(
	boards domain.BoardRepository,
	columns domain.ColumnRepository,
	cards domain.CardRepository,
) *BoardService {
	return &BoardService{boards: boards, columns: columns, cards: cards}
}

func (s *BoardService) GetAll(ctx context.Context) ([]domain.Board, error) {
	return s.boards.GetAll(ctx)
}

// Create creates a new board with 3 default columns (待辦, 進行中, 完成).
func (s *BoardService) Create(ctx context.Context, title string) (*domain.Board, error) {
	if title == "" {
		return nil, fmt.Errorf("%w: board title cannot be empty", domain.ErrValidation)
	}

	now := time.Now().UTC()
	board := &domain.Board{
		ID:        uuid.New().String(),
		Title:     title,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.boards.Create(ctx, board); err != nil {
		return nil, fmt.Errorf("create board: %w", err)
	}

	defaults := []domain.Column{
		{ID: uuid.New().String(), BoardID: board.ID, Title: "待辦", Position: 1000, CreatedAt: now},
		{ID: uuid.New().String(), BoardID: board.ID, Title: "進行中", Position: 2000, CreatedAt: now},
		{ID: uuid.New().String(), BoardID: board.ID, Title: "完成", Position: 3000, CreatedAt: now},
	}
	if err := s.columns.CreateBatch(ctx, defaults); err != nil {
		return nil, fmt.Errorf("create default columns: %w", err)
	}

	return board, nil
}

func (s *BoardService) Update(ctx context.Context, id, title string) (*domain.Board, error) {
	if title == "" {
		return nil, fmt.Errorf("%w: board title cannot be empty", domain.ErrValidation)
	}

	board, err := s.boards.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	board.Title = title
	board.UpdatedAt = time.Now().UTC()

	if err := s.boards.Update(ctx, board); err != nil {
		return nil, err
	}
	return board, nil
}

func (s *BoardService) Delete(ctx context.Context, id string) error {
	return s.boards.Delete(ctx, id)
}

// GetWithData loads a board with all its columns and cards in one call.
func (s *BoardService) GetWithData(ctx context.Context, boardID string) (*BoardData, error) {
	board, err := s.boards.GetByID(ctx, boardID)
	if err != nil {
		return nil, err
	}

	cols, err := s.columns.GetByBoardID(ctx, boardID)
	if err != nil {
		return nil, fmt.Errorf("get columns: %w", err)
	}

	result := make([]ColumnWithCards, 0, len(cols))
	for _, col := range cols {
		cards, err := s.cards.GetByColumnID(ctx, col.ID)
		if err != nil {
			return nil, fmt.Errorf("get cards for column %s: %w", col.ID, err)
		}
		if cards == nil {
			cards = []domain.Card{}
		}
		result = append(result, ColumnWithCards{Column: col, Cards: cards})
	}

	return &BoardData{Board: *board, Columns: result}, nil
}

// FilterCards returns a board's data filtered by priority.
func (s *BoardService) FilterCards(ctx context.Context, boardID, priority string) (*BoardData, error) {
	board, err := s.boards.GetByID(ctx, boardID)
	if err != nil {
		return nil, err
	}

	cols, err := s.columns.GetByBoardID(ctx, boardID)
	if err != nil {
		return nil, err
	}

	result := make([]ColumnWithCards, 0, len(cols))
	for _, col := range cols {
		cards, err := s.cards.GetByColumnID(ctx, col.ID)
		if err != nil {
			return nil, err
		}
		if priority != "" {
			filtered := make([]domain.Card, 0)
			for _, c := range cards {
				if c.Priority == priority {
					filtered = append(filtered, c)
				}
			}
			cards = filtered
		}
		if cards == nil {
			cards = []domain.Card{}
		}
		result = append(result, ColumnWithCards{Column: col, Cards: cards})
	}

	return &BoardData{Board: *board, Columns: result}, nil
}

// SeedIfEmpty creates a sample board on first launch.
func (s *BoardService) SeedIfEmpty(ctx context.Context) error {
	boards, err := s.boards.GetAll(ctx)
	if err != nil {
		return fmt.Errorf("check existing boards: %w", err)
	}
	if len(boards) > 0 {
		return nil
	}

	board, err := s.Create(ctx, "我的看板")
	if err != nil {
		return fmt.Errorf("seed board: %w", err)
	}

	cols, err := s.columns.GetByBoardID(ctx, board.ID)
	if err != nil {
		return fmt.Errorf("seed get columns: %w", err)
	}

	now := time.Now().UTC()
	sampleCards := []domain.Card{
		{
			ID: uuid.New().String(), ColumnID: cols[0].ID,
			Title: "歡迎使用看板！", Description: "這是一張示範卡片，你可以拖曳它到其他欄位",
			Priority: "medium", Position: 1000, CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New().String(), ColumnID: cols[0].ID,
			Title: "試試建立新卡片", Priority: "low", Position: 2000,
			CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New().String(), ColumnID: cols[1].ID,
			Title: "探索看板功能", Priority: "high", Position: 1000,
			CreatedAt: now, UpdatedAt: now,
		},
	}

	for i := range sampleCards {
		if err := s.cards.Create(ctx, &sampleCards[i]); err != nil {
			return fmt.Errorf("seed card: %w", err)
		}
	}

	return nil
}
