package domain

import "errors"

// Sentinel errors used across the domain layer.
//
// What: Predefined error values for common failure scenarios.
// Why: Enables callers to use errors.Is() for typed error handling without string matching.
// When: Returned by repositories and services when business rules are violated.
var (
	ErrNotFound   = errors.New("not found")
	ErrValidation = errors.New("validation error")
	ErrLastColumn = errors.New("cannot delete the last column in a board")
)
