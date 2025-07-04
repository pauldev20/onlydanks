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

func (b *Blob) SubmitBlob(ephemeralPubKey string, message string) error {
	return nil
}

func (b *Blob) GetKeys() ([]string, error) {
	return []string{"0x1", "0x2", "0x3"}, nil
}

func (b *Blob) GetMessages(prefix string) ([]string, error) {
	return []string{"message1", "message2", "message3"}, nil
}
