package blob

import (
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"proto-dankmessaging/backend/dependencies/queries/dbgen"
	"strconv"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/crypto/kzg4844"
	"github.com/rs/zerolog/log"
	"google.golang.org/protobuf/proto"
)

func (b *Blob) updateBlob() error {
	blockHeight, err := b.queries.GetBlobUpdate(context.Background())
	if err != nil {
		return errors.New("failed to get blob update: " + err.Error())
	}
	log.Info().Int64("block_height", blockHeight).Msg("updating blob")

	blobListUrl := "https://api.sepolia.blobscan.com/blobs?ps=50&sort=asc&type=canonical&startBlock=" + strconv.FormatInt(blockHeight, 10)
	resp, err := http.Get(blobListUrl)
	if err != nil {
		return errors.New("failed to get blob list: " + err.Error())
	}
	defer resp.Body.Close()
	var blobList struct {
		Blobs []struct {
			BlockNumber           uint64    `json:"blockNumber"`
			BlockTimestamp        time.Time `json:"blockTimestamp"`
			VersionedHash         string    `json:"versionedHash"`
			DataStorageReferences []struct {
				Storage string `json:"storage"`
				URL     string `json:"url"`
			} `json:"dataStorageReferences"`
		} `json:"blobs"`
	}
	err = json.NewDecoder(resp.Body).Decode(&blobList)
	if err != nil {
		return errors.New("failed to unmarshal blob list: " + err.Error())
	}
	log.Info().Int("blob_count", len(blobList.Blobs)).Msg("received blob list response")
	for _, blob := range blobList.Blobs {
		if blob.BlockNumber > uint64(blockHeight) {
			blockHeight = int64(blob.BlockNumber)
		}
		var rawBlobData []byte
		for _, dataStorageReference := range blob.DataStorageReferences {
			if dataStorageReference.Storage == "google" {
				rawBlobData, err = b.downloadBlob(dataStorageReference.URL)
				if err != nil {
					// log.Error().Err(err).Msg("failed to download blob")
					continue
				}
			}
		}
		if rawBlobData == nil {
			rawBlobData, err = b.downloadBlobWithoutGoogle(blob.VersionedHash)
			if err != nil {
				// log.Error().Err(err).Msg("failed to download blob without google")
				continue
			}
		}
		var kzgBlobContent kzg4844.Blob
		copy(kzgBlobContent[:], rawBlobData)
		blobData, err := DecodeBlobToData(&kzgBlobContent)
		if err != nil {
			return errors.New("failed to decode blob: " + err.Error())
		}
		// if blobData starts with blobMsgMagicBytes, then it is a valid blob
		if len(blobData) < 100 {
			continue
		}
		if !bytes.Equal(blobData[:len(blobMsgMagicBytes)], blobMsgMagicBytes) {
			log.Debug().Bytes("blob_data_first_bytes", blobData[:10]).Msg("blob data has no magic bytes")
			continue
		}
		log.Info().Bytes("blob_data_first_bytes", blobData[:10]).Msg("blob data has magic bytes")
		var blobContent BlobContent
		err = proto.Unmarshal(blobData[len(blobMsgMagicBytes):], &blobContent)
		if err != nil {
			log.Error().Err(err).Msg("failed to unmarshal blob")
			continue
		}
		err = b.addBlobToDB(&blobContent, blob.BlockTimestamp)
		if err != nil {
			log.Error().Err(err).Msg("failed to add blob to db")
			continue
		}
	}
	err = b.queries.UpdateBlobUpdate(context.Background(), blockHeight)
	if err != nil {
		return errors.New("failed to set blob update: " + err.Error())
	}
	b.blockHeight = blockHeight
	return nil
}

func (b *Blob) downloadBlob(url string) ([]byte, error) {
	return nil, errors.New("not implemented")
	resp, err := http.Get(url)
	if err != nil {
		return nil, errors.New("failed to get blob: " + err.Error())
	}
	defer resp.Body.Close()
	blobData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.New("failed to read blob: " + err.Error())
	}
	return blobData, nil
}

func (b *Blob) downloadBlobWithoutGoogle(id string) ([]byte, error) {
	if !strings.HasPrefix(id, "0x01afa44138089bc464a1c3dac1bc56230c90bb3ddea0f2c92f5534df9434af96") {
		return nil, errors.New("invalid id: " + id)
	}
	dataUrl := "https://api.sepolia.blobscan.com/blobs/" + id + "/data"
	resp, err := http.Get(dataUrl)
	if err != nil {
		return nil, errors.New("failed to get blob data: " + err.Error())
	}
	defer resp.Body.Close()
	blobData, err := io.ReadAll(resp.Body)
	blobData = blobData[3 : len(blobData)-1]
	hexBlobData, err := hex.DecodeString(string(blobData))
	if err != nil {
		return nil, errors.New("failed to decode blob data: " + err.Error())
	}
	log.Info().Bytes("blob_data_first_bytes", hexBlobData[:100]).Msg("blob data first 4 bytes")
	return hexBlobData, nil
}

func (b *Blob) addBlobToDB(blobContent *BlobContent, submitTime time.Time) error {
	for _, message := range blobContent.Messages {
		_, err := b.queries.AddMessage(
			context.Background(),
			dbgen.AddMessageParams{
				Index:           message.SearchIndex,
				Message:         message.Message,
				SubmitTime:      submitTime,
				NeedsSubmission: false,
			},
		)
		if err != nil {
			return errors.New("failed to add message to db: " + err.Error())
		}
		log.Info().Interface("message", message).Msg("added message to db")
	}
	return nil
}
