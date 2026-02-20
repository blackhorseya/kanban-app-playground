package sqlite

import "time"

// timeFormat is the canonical format used for storing time in SQLite TEXT columns.
const timeFormat = time.RFC3339

func formatTime(t time.Time) string {
	return t.Format(timeFormat)
}

// parseTime parses a time string stored in SQLite, supporting RFC3339, DateTime, and date-only formats.
func parseTime(s string) (time.Time, error) {
	if t, err := time.Parse(timeFormat, s); err == nil {
		return t, nil
	}
	if t, err := time.Parse(time.DateTime, s); err == nil {
		return t, nil
	}
	return time.Parse(time.DateOnly, s)
}
