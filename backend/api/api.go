package api

import (
	"proto-dankmessaging/backend/dependencies"

	"github.com/gofiber/fiber/v2"
)

type API struct {
	app *fiber.App
	dep *dependencies.Dependencies
}

func NewAPI(dep *dependencies.Dependencies) *API {
	api := &API{
		app: fiber.New(),
		dep: dep,
	}
	api.app.Get("/keys", api.GetKeys)
	api.app.Get("/messages/:key", api.GetMessage)
	api.app.Post("/messages", api.PostMessage)
	return api
}

func (a *API) Start() error {
	return a.app.Listen(":8080")
}

func (a *API) Stop() {
	a.app.Shutdown()
}
