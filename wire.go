//go:build wireinject
// +build wireinject

package main

import (
	"github.com/google/wire"

	"kanban-app-playground/internal/adapter"
	"kanban-app-playground/internal/application"
	"kanban-app-playground/internal/infrastructure/sqlite"
)

// InitializeHandler wires all dependencies and returns a ready-to-use Handler.
func InitializeHandler() (*adapter.Handler, func(), error) {
	wire.Build(sqlite.DBSet, sqlite.RepoSet, application.ServiceSet, adapter.HandlerSet)
	return nil, nil, nil
}
