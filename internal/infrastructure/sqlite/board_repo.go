package sqlite

import (
	"context"
	"database/sql"
	"fmt"

	"kanban-app-playground/internal/domain"
)

type BoardRepo struct {
	db *sql.DB
}

func NewBoardRepo(db *DB) *BoardRepo {
	return &BoardRepo{db: db.DB}
}

func scanBoard(sc interface{ Scan(dest ...any) error }) (domain.Board, error) {
	var b domain.Board
	var createdAt, updatedAt string
	if err := sc.Scan(&b.ID, &b.Title, &createdAt, &updatedAt); err != nil {
		return b, err
	}
	var err error
	if b.CreatedAt, err = parseTime(createdAt); err != nil {
		return b, fmt.Errorf("parse created_at: %w", err)
	}
	if b.UpdatedAt, err = parseTime(updatedAt); err != nil {
		return b, fmt.Errorf("parse updated_at: %w", err)
	}
	return b, nil
}

func (r *BoardRepo) GetAll(ctx context.Context) ([]domain.Board, error) {
	rows, err := r.db.QueryContext(ctx,
		"SELECT id, title, created_at, updated_at FROM boards ORDER BY created_at ASC",
	)
	if err != nil {
		return nil, fmt.Errorf("query boards: %w", err)
	}
	defer rows.Close()

	var boards []domain.Board
	for rows.Next() {
		b, err := scanBoard(rows)
		if err != nil {
			return nil, fmt.Errorf("scan board: %w", err)
		}
		boards = append(boards, b)
	}
	return boards, rows.Err()
}

func (r *BoardRepo) GetByID(ctx context.Context, id string) (*domain.Board, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, title, created_at, updated_at FROM boards WHERE id = ?", id,
	)
	b, err := scanBoard(row)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("board %s: %w", id, domain.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("query board: %w", err)
	}
	return &b, nil
}

func (r *BoardRepo) Create(ctx context.Context, board *domain.Board) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO boards (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
		board.ID, board.Title, formatTime(board.CreatedAt), formatTime(board.UpdatedAt),
	)
	if err != nil {
		return fmt.Errorf("insert board: %w", err)
	}
	return nil
}

func (r *BoardRepo) Update(ctx context.Context, board *domain.Board) error {
	res, err := r.db.ExecContext(ctx,
		"UPDATE boards SET title = ?, updated_at = ? WHERE id = ?",
		board.Title, formatTime(board.UpdatedAt), board.ID,
	)
	if err != nil {
		return fmt.Errorf("update board: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("board %s: %w", board.ID, domain.ErrNotFound)
	}
	return nil
}

func (r *BoardRepo) Delete(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM boards WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete board: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("board %s: %w", id, domain.ErrNotFound)
	}
	return nil
}
