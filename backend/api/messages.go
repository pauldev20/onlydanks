package api

import (
	"context"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"proto-dankmessaging/backend/dependencies/queries/dbgen"
	"time"

	"github.com/go-playground/validator"
	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog/log"
)

type PostMessageRequest struct {
	EphemeralPubKey string `json:"ephemeral_pubkey" validate:"required,hexadecimal"`
	SearchIndex     string `json:"search_index" validate:"required,hexadecimal"`
	Message         string `json:"message" validate:"required,base64"`
}

type PostMessageRequestBytes struct {
	EphemeralPubKey []byte `json:"ephemeral_pubkey"`
	SearchIndex     []byte `json:"search_index"`
	Message         []byte `json:"message"`
}

func (a *API) PostMessage(c *fiber.Ctx) error {
	var request PostMessageRequest
	err := c.BodyParser(&request)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	validate := validator.New()
	err = validate.Struct(request)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	requestBytes, err := convertPostMessageRequestToBytes(request)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	err = a.bypassBlob(c.Context(), requestBytes)
	if err != nil {
		log.Error().Err(err).Msg("Failed to add directly to the database")
	}
	_, err = a.queries.AddBlobSubmission(c.Context(), dbgen.AddBlobSubmissionParams{
		Index:   requestBytes.SearchIndex,
		Message: requestBytes.Message,
		Pubkey:  requestBytes.EphemeralPubKey,
	})
	if err != nil {
		log.Error().Err(err).Msg("Failed to add blob submission")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusOK)
}

func convertPostMessageRequestToBytes(request PostMessageRequest) (PostMessageRequestBytes, error) {
	ephemeralPubKey, err := hex.DecodeString(request.EphemeralPubKey)
	if err != nil {
		return PostMessageRequestBytes{}, errors.New("failed to decode ephemeral pubkey: " + err.Error())
	}
	searchIndex, err := hex.DecodeString(request.SearchIndex)
	if err != nil {
		return PostMessageRequestBytes{}, errors.New("failed to decode search index: " + err.Error())
	}
	message, err := base64.StdEncoding.DecodeString(request.Message)
	if err != nil {
		return PostMessageRequestBytes{}, errors.New("failed to decode message: " + err.Error())
	}
	return PostMessageRequestBytes{
		EphemeralPubKey: ephemeralPubKey,
		SearchIndex:     searchIndex,
		Message:         message,
	}, nil
}

type MessageResponse struct {
	Message    []byte    `json:"message"`
	SubmitTime time.Time `json:"submit_time"`
}

func (a *API) GetMessage(c *fiber.Ctx) error {
	index := c.Params("index")
	if index == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Index is required"})
	}
	indexBytes, err := hex.DecodeString(index)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid index: " + err.Error()})
	}
	messages, err := a.queries.GetMessagesByIndex(c.Context(), indexBytes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	messageResponses := make([]MessageResponse, len(messages))
	for i, message := range messages {
		messageResponses[i] = MessageResponse{
			Message:    message.Message,
			SubmitTime: message.SubmitTime,
		}
	}
	return c.JSON(messageResponses)
}

// will add it directly to the database makes the whole process faster but can not test blobs using this
func (a *API) bypassBlob(ctx context.Context, msg PostMessageRequestBytes) error {
	_, err := a.queries.AddPubkey(ctx, dbgen.AddPubkeyParams{
		Pubkey:     msg.EphemeralPubKey,
		SubmitTime: time.Now(),
	})
	if err != nil {
		log.Error().Err(err).Msg("failed to add pubkey")
		return errors.New("failed to add pubkey: " + err.Error())
	}
	_, err = a.queries.AddMessage(ctx, dbgen.AddMessageParams{
		Index:           msg.SearchIndex,
		Message:         msg.Message,
		SubmitTime:      time.Now(),
		NeedsSubmission: true,
	})
	if err != nil {
		log.Error().Err(err).Msg("failed to add message")
		return errors.New("failed to add message: " + err.Error())
	}
	return nil
}
