package blob

import (
	"time"
)

type Key struct {
	key    string
	expiry time.Time
}
