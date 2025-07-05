package blob_test

import (
	"bytes"
	"testing"

	"proto-dankmessaging/backend/blob"
)

func TestEncodeDecodeBlob(t *testing.T) {
	tests := [][]byte{
		[]byte("hello world"),
		bytes.Repeat([]byte{0x01}, 31),
		bytes.Repeat([]byte{0x42}, 1000),
	}

	for i, input := range tests {
		blobData, err := blob.EncodeDataToBlob(input)
		if err != nil {
			t.Fatalf("Test %d: encode error: %v", i, err)
		}

		decoded, err := blob.DecodeBlobToData(blobData)
		if err != nil {
			t.Fatalf("Test %d: decode error: %v", i, err)
		}

		if !bytes.Equal(input, decoded) {
			t.Errorf("Test %d: round-trip mismatch\nOriginal: %x\nDecoded:  %x", i, input, decoded)
		}
	}
}
