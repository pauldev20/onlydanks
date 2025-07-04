package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

func (a *API) GetKeys(c *fiber.Ctx) error {
	since := c.Query("since")
	sinceTime, err := time.Parse(time.RFC3339, since)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	keys, err := a.queries.GetPubkeysSince(c.Context(), &sinceTime)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	keyString := make([]string, len(keys))
	for i, key := range keys {
		keyString[i] = key.Pubkey
	}
	return c.JSON(keyString)
}
