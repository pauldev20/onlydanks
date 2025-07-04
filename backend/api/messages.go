package api

import (
	"context"
	"errors"
	"proto-dankmessaging/backend/dependencies/queries/dbgen"
	"time"

	"github.com/go-playground/validator"
	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog/log"
)

type PostMessageRequest struct {
	EphemeralPubKey string `json:"ephemeral_pubkey" validate:"required,len=64,hexadecimal"`
	SearchIndex     string `json:"search_index" validate:"required"`
	Message         string `json:"message" validate:"required"`
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
	err = a.bypassAdd(c.Context(), request)
	if err != nil {
		log.Error().Err(err).Msg("Failed to add directly to the database")
	}
	err = a.blob.SubmitBlob(request.EphemeralPubKey, request.SearchIndex, request.Message)
	if err != nil {
		log.Error().Err(err).Msg("Failed to submit blob")
	}
	return c.SendStatus(fiber.StatusOK)
}

type MessageResponse struct {
	Message    string    `json:"message"`
	SubmitTime time.Time `json:"submit_time"`
}

func (a *API) GetMessage(c *fiber.Ctx) error {
	index := c.Params("index")
	if index == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Index is required"})
	}
	messages, err := a.queries.GetMessagesByIndex(c.Context(), index)
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
func (a *API) bypassAdd(ctx context.Context, msg PostMessageRequest) error {
	_, err := a.queries.AddPubkey(ctx, dbgen.AddPubkeyParams{
		Pubkey:     msg.EphemeralPubKey,
		SubmitTime: time.Now(),
	})
	if err != nil {
		return errors.New("failed to add pubkey: " + err.Error())
	}
	_, err = a.queries.AddMessage(ctx, dbgen.AddMessageParams{
		Index:      msg.SearchIndex,
		Message:    msg.Message,
		SubmitTime: time.Now(),
	})
	if err != nil {
		return errors.New("failed to add message: " + err.Error())
	}
	return nil
}
