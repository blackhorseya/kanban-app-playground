package main

import (
	"context"
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	handler, cleanup, err := InitializeHandler()
	if err != nil {
		log.Fatalf("Failed to initialize: %v", err)
	}
	defer cleanup()

	if err := handler.SeedIfEmpty(context.Background()); err != nil {
		log.Printf("Warning: seed failed: %v", err)
	}

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
