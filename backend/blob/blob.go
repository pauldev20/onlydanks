package blob

import (
	"context"
	"proto-dankmessaging/backend/dependencies"
)

type Blob struct {
	dep *dependencies.Dependencies
}

func NewBlob(dep *dependencies.Dependencies) *Blob {
	return &Blob{
		dep: dep,
	}
}

// should keep listening for new blobs and add them to the database
func (b *Blob) Start(ctx context.Context) error {
	select {
	case <-ctx.Done():
		return nil
	}
}

func (b *Blob) SubmitBlob(ephemeralPubKey string, searchIndex string, message string) error {
	return nil
}
