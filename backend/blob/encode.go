package blob

import (
	"errors"

	"github.com/ethereum/go-ethereum/crypto/kzg4844"
)

func EncodeDataToBlob(data []byte) (*kzg4844.Blob, error) {
	const (
		BlobSize         = 131072 // 4096 * 32 bytes
		FieldElementSize = 32
		// Use 31 bytes per field element to ensure canonical form
		UsableBytes = 31
	)

	var blob kzg4844.Blob

	// Calculate how many field elements we need
	numFieldElements := (len(data) + UsableBytes - 1) / UsableBytes
	if numFieldElements > 4096 {
		return nil, errors.New("data too large for single blob")
	}

	// Encode data into field elements
	for i := 0; i < numFieldElements; i++ {
		start := i * UsableBytes
		end := start + UsableBytes
		if end > len(data) {
			end = len(data)
		}

		// Copy up to 31 bytes into each field element, leaving the first byte as 0
		fieldElementStart := i * FieldElementSize
		blob[fieldElementStart] = 0 // Ensure first byte is 0 for canonical form
		copy(blob[fieldElementStart+1:fieldElementStart+FieldElementSize], data[start:end])
	}

	return &blob, nil
}

func DecodeBlobToData(blob *kzg4844.Blob) ([]byte, error) {
	const (
		FieldElementSize = 32
		UsableBytes      = 31
	)

	var data []byte

	// Process each field element
	for i := 0; i < 4096; i++ {
		fieldElementStart := i * FieldElementSize

		// Extract the data portion (skip first byte which should be 0)
		fieldData := blob[fieldElementStart+1 : fieldElementStart+FieldElementSize]

		// Check if this field element contains any data
		hasData := false
		for _, b := range fieldData {
			if b != 0 {
				hasData = true
				break
			}
		}

		if !hasData {
			// We've reached the end of the data (all zeros)
			break
		}

		data = append(data, fieldData...)
	}

	// Trim trailing zeros from the result
	for len(data) > 0 && data[len(data)-1] == 0 {
		data = data[:len(data)-1]
	}

	return data, nil
}
