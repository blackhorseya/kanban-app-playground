package application

import "github.com/google/wire"

var ServiceSet = wire.NewSet(
	NewBoardService,
	NewColumnService,
	NewCardService,
)
