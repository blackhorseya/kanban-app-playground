package sqlite

import (
	"github.com/google/wire"

	"kanban-app-playground/internal/domain"
)

// ProvideDB creates a *DB and returns a cleanup function that closes it.
func ProvideDB() (*DB, func(), error) {
	db, err := NewDB()
	if err != nil {
		return nil, nil, err
	}
	cleanup := func() { db.Close() }
	return db, cleanup, nil
}

var DBSet = wire.NewSet(ProvideDB)

var RepoSet = wire.NewSet(
	NewBoardRepo,
	NewColumnRepo,
	NewCardRepo,
	wire.Bind(new(domain.BoardRepository), new(*BoardRepo)),
	wire.Bind(new(domain.ColumnRepository), new(*ColumnRepo)),
	wire.Bind(new(domain.CardRepository), new(*CardRepo)),
)
