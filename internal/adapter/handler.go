package adapter

import (
	"context"

	"kanban-app-playground/internal/application"
	"kanban-app-playground/internal/domain"
)

// Handler is the Wails binding struct. All exported methods
// are exposed to the frontend as TypeScript functions.
type Handler struct {
	ctx       context.Context
	boardSvc  *application.BoardService
	columnSvc *application.ColumnService
	cardSvc   *application.CardService
}

func NewHandler(
	boardSvc *application.BoardService,
	columnSvc *application.ColumnService,
	cardSvc *application.CardService,
) *Handler {
	return &Handler{
		boardSvc:  boardSvc,
		columnSvc: columnSvc,
		cardSvc:   cardSvc,
	}
}

// Startup is called by Wails when the app starts.
func (h *Handler) Startup(ctx context.Context) {
	h.ctx = ctx
}

// Shutdown is called by Wails when the app is closing.
func (h *Handler) Shutdown(_ context.Context) {}

// SeedIfEmpty delegates to BoardService to populate sample data on first launch.
func (h *Handler) SeedIfEmpty(ctx context.Context) error {
	return h.boardSvc.SeedIfEmpty(ctx)
}

// ─── Board ──────────────────────────────────────────────────

func (h *Handler) GetAllBoards() ([]domain.Board, error) {
	boards, err := h.boardSvc.GetAll(h.ctx)
	if err != nil {
		return nil, err
	}
	if boards == nil {
		boards = []domain.Board{}
	}
	return boards, nil
}

func (h *Handler) CreateBoard(title string) (*domain.Board, error) {
	return h.boardSvc.Create(h.ctx, title)
}

func (h *Handler) UpdateBoard(id, title string) (*domain.Board, error) {
	return h.boardSvc.Update(h.ctx, id, title)
}

func (h *Handler) DeleteBoard(id string) error {
	return h.boardSvc.Delete(h.ctx, id)
}

func (h *Handler) GetBoardWithData(boardID string) (*application.BoardData, error) {
	return h.boardSvc.GetWithData(h.ctx, boardID)
}

// ─── Column ─────────────────────────────────────────────────

func (h *Handler) CreateColumn(boardID, title string) (*domain.Column, error) {
	return h.columnSvc.Create(h.ctx, boardID, title)
}

func (h *Handler) UpdateColumn(id, title string) (*domain.Column, error) {
	return h.columnSvc.Update(h.ctx, id, title)
}

func (h *Handler) DeleteColumn(id string, moveCardsTo string) error {
	return h.columnSvc.Delete(h.ctx, id, moveCardsTo)
}

func (h *Handler) MoveColumn(id string, newPosition int) error {
	return h.columnSvc.Move(h.ctx, id, newPosition)
}

// ─── Card ───────────────────────────────────────────────────

func (h *Handler) CreateCard(columnID, title string) (*domain.Card, error) {
	return h.cardSvc.Create(h.ctx, columnID, title)
}

func (h *Handler) UpdateCard(id string, updates domain.CardUpdate) (*domain.Card, error) {
	return h.cardSvc.Update(h.ctx, id, updates)
}

func (h *Handler) DeleteCard(id string) error {
	return h.cardSvc.Delete(h.ctx, id)
}

func (h *Handler) MoveCard(id, targetColumnID string, newPosition int) error {
	return h.cardSvc.Move(h.ctx, id, targetColumnID, newPosition)
}

// ─── Search ─────────────────────────────────────────────────

func (h *Handler) SearchCards(boardID, query string) ([]domain.Card, error) {
	cards, err := h.cardSvc.Search(h.ctx, boardID, query)
	if err != nil {
		return nil, err
	}
	if cards == nil {
		cards = []domain.Card{}
	}
	return cards, nil
}

func (h *Handler) FilterCards(boardID, priority string) (*application.BoardData, error) {
	return h.boardSvc.FilterCards(h.ctx, boardID, priority)
}
