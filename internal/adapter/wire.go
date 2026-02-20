package adapter

import "github.com/google/wire"

var HandlerSet = wire.NewSet(
	NewHandler,
)
