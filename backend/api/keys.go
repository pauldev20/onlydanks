package api

import "github.com/gofiber/fiber/v2"

func (a *API) GetKeys(c *fiber.Ctx) error {
	mockKeys := []string{"0x1", "0x2", "0x3"}
	return c.JSON(mockKeys)
}
