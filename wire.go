//go:build wireinject
// +build wireinject

package main

import (
	"github.com/google/wire"

	"kanban-app-playground/internal/adapter"
	"kanban-app-playground/internal/application"
	"kanban-app-playground/internal/domain"
	"kanban-app-playground/internal/infrastructure/sqlite"
)

// ProvideDB creates a *sqlite.DB and returns a cleanup function that closes it.
func ProvideDB() (*sqlite.DB, func(), error) {
	db, err := sqlite.NewDB()
	if err != nil {
		return nil, nil, err
	}
	cleanup := func() { db.Close() }
	return db, cleanup, nil
}

var DBSet = wire.NewSet(ProvideDB)

var RepoSet = wire.NewSet(
	sqlite.NewBoardRepo,
	sqlite.NewColumnRepo,
	sqlite.NewCardRepo,
	wire.Bind(new(domain.BoardRepository), new(*sqlite.BoardRepo)),
	wire.Bind(new(domain.ColumnRepository), new(*sqlite.ColumnRepo)),
	wire.Bind(new(domain.CardRepository), new(*sqlite.CardRepo)),
)

var ServiceSet = wire.NewSet(
	application.NewBoardService,
	application.NewColumnService,
	application.NewCardService,
)

var HandlerSet = wire.NewSet(
	adapter.NewHandler,
)

// InitializeHandler wires all dependencies and returns a ready-to-use Handler.
func InitializeHandler() (*adapter.Handler, func(), error) {
	wire.Build(DBSet, RepoSet, ServiceSet, HandlerSet)
	return nil, nil, nil
}
