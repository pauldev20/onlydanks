package api

import (
	"github.com/gofiber/fiber/v2"
)

func (a *API) RegisterENS(ctx *fiber.Ctx) error {
	var req struct {
		Subdomain string `json:"subdomain"`
		Address   string `json:"address"`
	}
	err := ctx.BodyParser(&req)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if len(req.Subdomain) > 32 || len(req.Subdomain) < 3 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "subdomain must be between 3 and 32 characters"})
	}
	for _, char := range req.Subdomain {
		if char < 'a' || char > 'z' {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "subdomain must be lowercase alphabetical letters"})
		}
	}
	err = a.ens.RegisterENS(req.Subdomain, req.Address)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "ENS subdomain registered"})
}
