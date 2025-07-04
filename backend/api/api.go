package api

import (
	"github.com/gofiber/fiber/v2"
)

type API struct {
	app *fiber.App
}

func NewAPI() *API {
	return &API{
		app: fiber.New(),
	}
}

func (a *API) Start() error {
	return a.app.Listen(":8080")
}

func (a *API) Stop() {
	a.app.Shutdown()
}
