package blob

import (
	"context"
	"proto-dankmessaging/backend/dependencies"
	"proto-dankmessaging/backend/dependencies/queries/dbgen"
	"time"

	"github.com/rs/zerolog/log"
	"google.golang.org/protobuf/proto"
)

type Blob struct {
	dep     *dependencies.Dependencies
	queries *dbgen.Queries
}

func NewBlob(dep *dependencies.Dependencies) *Blob {
	return &Blob{
		dep:     dep,
		queries: dbgen.New(dep.DB.Pool()),
	}
}

// should keep listening for new blobs and add them to the database
func (b *Blob) Start(ctx context.Context) error {
	submitterTicker := time.NewTicker(1 * time.Second)
	updateTicker := time.NewTicker(10 * time.Second)
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-submitterTicker.C:
			b.submitBlob()
		case <-updateTicker.C:
			b.updateBlob()
		}
	}
}

func (b *Blob) submitBlob() error {
	msgs, err := b.queries.GetBlobSubmissions(context.Background())
	if err != nil {
		return err
	}
	if len(msgs) == 0 {
		return nil
	}
	blob := &BlobContent{
		Messages: []*Message{},
	}
	for _, msg := range msgs {
		blob.Messages = append(blob.Messages, &Message{
			EphemeralPubkey: msg.Pubkey,
			SearchIndex:     msg.Index,
			Message:         msg.Message,
		})
	}
	blobBytes, err := proto.Marshal(blob)
	if err != nil {
		return err
	}
	// now submit this blob to the chain
	log.Info().Msgf("Submitting blob to the chain: %v", blobBytes)

	// remove the blob from the database
	for _, msg := range msgs {
		err = b.queries.RemoveBlobSubmission(context.Background(), msg.ID)
		if err != nil {
			return err
		}
	}
	return nil
}

func (b *Blob) updateBlob() error {
	return nil
}
