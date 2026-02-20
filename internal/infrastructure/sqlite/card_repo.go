package sqlite

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"kanban-app-playground/internal/domain"
)

type CardRepo struct {
	db *sql.DB
}

func NewCardRepo(db *DB) *CardRepo {
	return &CardRepo{db: db.DB}
}

// scanCard scans a card row, handling nullable due_date and TEXT→time.Time conversion.
func scanCard(sc interface{ Scan(dest ...any) error }) (domain.Card, error) {
	var c domain.Card
	var due sql.NullString
	var createdAt, updatedAt string
	if err := sc.Scan(
		&c.ID, &c.ColumnID, &c.Title, &c.Description, &c.Priority,
		&due, &c.Position, &createdAt, &updatedAt,
	); err != nil {
		return c, err
	}

	var err error
	if c.CreatedAt, err = parseTime(createdAt); err != nil {
		return c, fmt.Errorf("parse created_at: %w", err)
	}
	if c.UpdatedAt, err = parseTime(updatedAt); err != nil {
		return c, fmt.Errorf("parse updated_at: %w", err)
	}
	if due.Valid {
		t, err := parseTime(due.String)
		if err != nil {
			return c, fmt.Errorf("parse due_date: %w", err)
		}
		c.DueDate = &t
	}
	return c, nil
}

func (r *CardRepo) GetByColumnID(ctx context.Context, columnID string) ([]domain.Card, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, column_id, title, COALESCE(description, ''), priority,
		        due_date, position, created_at, updated_at
		 FROM cards WHERE column_id = ? ORDER BY position ASC`, columnID,
	)
	if err != nil {
		return nil, fmt.Errorf("query cards: %w", err)
	}
	defer rows.Close()

	var cards []domain.Card
	for rows.Next() {
		c, err := scanCard(rows)
		if err != nil {
			return nil, fmt.Errorf("scan card: %w", err)
		}
		cards = append(cards, c)
	}
	return cards, rows.Err()
}

func (r *CardRepo) Create(ctx context.Context, card *domain.Card) error {
	var dueStr any
	if card.DueDate != nil {
		dueStr = formatTime(*card.DueDate)
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO cards (id, column_id, title, description, priority, due_date, position, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		card.ID, card.ColumnID, card.Title, card.Description, card.Priority,
		dueStr, card.Position, formatTime(card.CreatedAt), formatTime(card.UpdatedAt),
	)
	if err != nil {
		return fmt.Errorf("insert card: %w", err)
	}
	return nil
}

func (r *CardRepo) Update(ctx context.Context, id string, updates domain.CardUpdate) (*domain.Card, error) {
	now := formatTime(time.Now().UTC())

	var b strings.Builder
	args := []any{now}
	b.WriteString("updated_at = ?")

	if updates.Title != nil {
		b.WriteString(", title = ?")
		args = append(args, *updates.Title)
	}
	if updates.Description != nil {
		b.WriteString(", description = ?")
		args = append(args, *updates.Description)
	}
	if updates.Priority != nil {
		b.WriteString(", priority = ?")
		args = append(args, *updates.Priority)
	}
	if updates.DueDate != nil {
		b.WriteString(", due_date = ?")
		if *updates.DueDate == "" {
			args = append(args, nil)
		} else {
			args = append(args, *updates.DueDate)
		}
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE cards SET %s WHERE id = ?", b.String())

	res, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("update card: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, fmt.Errorf("card %s: %w", id, domain.ErrNotFound)
	}

	row := r.db.QueryRowContext(ctx,
		`SELECT id, column_id, title, COALESCE(description, ''), priority,
		        due_date, position, created_at, updated_at
		 FROM cards WHERE id = ?`, id,
	)
	c, err := scanCard(row)
	if err != nil {
		return nil, fmt.Errorf("read updated card: %w", err)
	}
	return &c, nil
}

func (r *CardRepo) Delete(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM cards WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete card: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("card %s: %w", id, domain.ErrNotFound)
	}
	return nil
}

func (r *CardRepo) Move(ctx context.Context, id, targetColumnID string, newPosition int) error {
	now := formatTime(time.Now().UTC())
	res, err := r.db.ExecContext(ctx,
		"UPDATE cards SET column_id = ?, position = ?, updated_at = ? WHERE id = ?",
		targetColumnID, newPosition, now, id,
	)
	if err != nil {
		return fmt.Errorf("move card: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("card %s: %w", id, domain.ErrNotFound)
	}
	return nil
}

func (r *CardRepo) MoveAllToColumn(ctx context.Context, fromColumnID, toColumnID string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE cards SET column_id = ? WHERE column_id = ?",
		toColumnID, fromColumnID,
	)
	if err != nil {
		return fmt.Errorf("move cards between columns: %w", err)
	}
	return nil
}

func (r *CardRepo) MaxPosition(ctx context.Context, columnID string) (int, error) {
	var maxPos sql.NullInt64
	err := r.db.QueryRowContext(ctx,
		"SELECT MAX(position) FROM cards WHERE column_id = ?", columnID,
	).Scan(&maxPos)
	if err != nil {
		return 0, fmt.Errorf("max position: %w", err)
	}
	if !maxPos.Valid {
		return 0, nil
	}
	return int(maxPos.Int64), nil
}

func (r *CardRepo) Search(ctx context.Context, boardID, query string) ([]domain.Card, error) {
	pattern := "%" + query + "%"
	rows, err := r.db.QueryContext(ctx,
		`SELECT c.id, c.column_id, c.title, COALESCE(c.description, ''), c.priority,
		        c.due_date, c.position, c.created_at, c.updated_at
		 FROM cards c
		 JOIN columns col ON c.column_id = col.id
		 WHERE col.board_id = ? AND (c.title LIKE ? OR c.description LIKE ?)
		 ORDER BY c.position ASC`,
		boardID, pattern, pattern,
	)
	if err != nil {
		return nil, fmt.Errorf("search cards: %w", err)
	}
	defer rows.Close()

	var cards []domain.Card
	for rows.Next() {
		c, err := scanCard(rows)
		if err != nil {
			return nil, fmt.Errorf("scan card: %w", err)
		}
		cards = append(cards, c)
	}
	return cards, rows.Err()
}
