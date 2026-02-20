package main

import (
	"context"
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"kanban-app-playground/internal/adapter"
	"kanban-app-playground/internal/application"
	"kanban-app-playground/internal/infrastructure/sqlite"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// ── Infrastructure ──────────────────────────────────────────
	db, err := sqlite.NewDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	boardRepo := sqlite.NewBoardRepo(db)
	columnRepo := sqlite.NewColumnRepo(db)
	cardRepo := sqlite.NewCardRepo(db)

	// ── Application ─────────────────────────────────────────────
	boardSvc := application.NewBoardService(boardRepo, columnRepo, cardRepo)
	columnSvc := application.NewColumnService(columnRepo, cardRepo)
	cardSvc := application.NewCardService(cardRepo, columnRepo)

	// ── Adapter (Wails binding) ─────────────────────────────────
	handler := adapter.NewHandler(boardSvc, columnSvc, cardSvc)

	// ── Seed sample data on first launch ────────────────────────
	if err := boardSvc.SeedIfEmpty(context.Background()); err != nil {
		log.Printf("Warning: seed failed: %v", err)
	}

	// ── Start Wails application ─────────────────────────────────
	if err := wails.Run(&options.App{
		Title:  "Kanban Board",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        handler.Startup,
		OnShutdown:       handler.Shutdown,
		Bind: []interface{}{
			handler,
		},
	}); err != nil {
		log.Fatalf("Wails error: %v", err)
	}
}
