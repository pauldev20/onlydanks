package api

import (
	"proto-dankmessaging/backend/dependencies/queries/dbgen"

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
	err = a.queries.AddENSSubdomain(ctx.Context(), dbgen.AddENSSubdomainParams{
		Subdomain: req.Subdomain,
		Address:   req.Address,
	})
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "ENS subdomain registered"})
}

func (a *API) GetENS(ctx *fiber.Ctx) error {
	address := ctx.Params("address")
	subdomain, err := a.queries.GetENSSubdomainByAddress(ctx.Context(), address)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"subdomain": subdomain})
}
