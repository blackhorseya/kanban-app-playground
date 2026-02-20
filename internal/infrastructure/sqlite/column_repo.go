package sqlite

import (
	"context"
	"database/sql"
	"fmt"

	"kanban-app-playground/internal/domain"
)

type ColumnRepo struct {
	db *sql.DB
}

func NewColumnRepo(db *DB) *ColumnRepo {
	return &ColumnRepo{db: db.DB}
}

func scanColumn(sc interface{ Scan(dest ...any) error }) (domain.Column, error) {
	var c domain.Column
	var createdAt string
	if err := sc.Scan(&c.ID, &c.BoardID, &c.Title, &c.Position, &createdAt); err != nil {
		return c, err
	}
	var err error
	if c.CreatedAt, err = parseTime(createdAt); err != nil {
		return c, fmt.Errorf("parse created_at: %w", err)
	}
	return c, nil
}

func (r *ColumnRepo) GetByBoardID(ctx context.Context, boardID string) ([]domain.Column, error) {
	rows, err := r.db.QueryContext(ctx,
		"SELECT id, board_id, title, position, created_at FROM columns WHERE board_id = ? ORDER BY position ASC",
		boardID,
	)
	if err != nil {
		return nil, fmt.Errorf("query columns: %w", err)
	}
	defer rows.Close()

	var cols []domain.Column
	for rows.Next() {
		c, err := scanColumn(rows)
		if err != nil {
			return nil, fmt.Errorf("scan column: %w", err)
		}
		cols = append(cols, c)
	}
	return cols, rows.Err()
}

func (r *ColumnRepo) GetByID(ctx context.Context, id string) (*domain.Column, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, board_id, title, position, created_at FROM columns WHERE id = ?", id,
	)
	c, err := scanColumn(row)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("column %s: %w", id, domain.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("query column: %w", err)
	}
	return &c, nil
}

func (r *ColumnRepo) Create(ctx context.Context, col *domain.Column) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO columns (id, board_id, title, position, created_at) VALUES (?, ?, ?, ?, ?)",
		col.ID, col.BoardID, col.Title, col.Position, formatTime(col.CreatedAt),
	)
	if err != nil {
		return fmt.Errorf("insert column: %w", err)
	}
	return nil
}

func (r *ColumnRepo) CreateBatch(ctx context.Context, cols []domain.Column) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	for i := range cols {
		if _, err := tx.ExecContext(ctx,
			"INSERT INTO columns (id, board_id, title, position, created_at) VALUES (?, ?, ?, ?, ?)",
			cols[i].ID, cols[i].BoardID, cols[i].Title, cols[i].Position, formatTime(cols[i].CreatedAt),
		); err != nil {
			return fmt.Errorf("insert column %d: %w", i, err)
		}
	}
	return tx.Commit()
}

func (r *ColumnRepo) Update(ctx context.Context, col *domain.Column) error {
	res, err := r.db.ExecContext(ctx,
		"UPDATE columns SET title = ? WHERE id = ?",
		col.Title, col.ID,
	)
	if err != nil {
		return fmt.Errorf("update column: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("column %s: %w", col.ID, domain.ErrNotFound)
	}
	return nil
}

func (r *ColumnRepo) Delete(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM columns WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete column: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("column %s: %w", id, domain.ErrNotFound)
	}
	return nil
}

func (r *ColumnRepo) CountByBoardID(ctx context.Context, boardID string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM columns WHERE board_id = ?", boardID,
	).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count columns: %w", err)
	}
	return count, nil
}

func (r *ColumnRepo) MaxPosition(ctx context.Context, boardID string) (int, error) {
	var maxPos sql.NullInt64
	err := r.db.QueryRowContext(ctx,
		"SELECT MAX(position) FROM columns WHERE board_id = ?", boardID,
	).Scan(&maxPos)
	if err != nil {
		return 0, fmt.Errorf("max position: %w", err)
	}
	if !maxPos.Valid {
		return 0, nil
	}
	return int(maxPos.Int64), nil
}

func (r *ColumnRepo) UpdatePosition(ctx context.Context, id string, position int) error {
	res, err := r.db.ExecContext(ctx,
		"UPDATE columns SET position = ? WHERE id = ?", position, id,
	)
	if err != nil {
		return fmt.Errorf("update position: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("column %s: %w", id, domain.ErrNotFound)
	}
	return nil
}
