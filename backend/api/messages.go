package api

import (
	"proto-dankmessaging/backend/dependencies/queries/dbgen"
	"time"

	"github.com/gofiber/fiber/v2"
)

type PostMessageRequest struct {
	EphemeralPubKey string `json:"ephemeral_pubkey"`
	Message         string `json:"message"`
}

func (a *API) PostMessage(c *fiber.Ctx) error {
	var request PostMessageRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	now := time.Now()
	a.queries.AddPubkey(c.Context(), dbgen.AddPubkeyParams{
		Pubkey:     request.EphemeralPubKey,
		SubmitTime: &now,
	})
	return c.SendStatus(fiber.StatusOK)
}

func (a *API) GetMessage(c *fiber.Ctx) error {
	key := c.Params("key")
	if key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Key is required"})
	}
	messages := []string{"message1", "message2", "message3"}
	return c.JSON(messages)
}
