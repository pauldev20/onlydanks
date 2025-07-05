package api

import (
	"fmt"
	"proto-dankmessaging/backend/dependencies"
	"proto-dankmessaging/backend/dependencies/queries/dbgen"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type API struct {
	app     *fiber.App
	dep     *dependencies.Dependencies
	queries *dbgen.Queries
}

func NewAPI(dep *dependencies.Dependencies) *API {
	queries := dbgen.New(dep.DB.Pool())
	api := &API{
		app:     fiber.New(),
		dep:     dep,
		queries: queries,
	}

	// Add CORS middleware to allow all origins
	api.app.Use(cors.New())

	api.app.Get("/keys", api.GetKeys)
	api.app.Get("/messages/:index", api.GetMessage)
	api.app.Post("/messages", api.PostMessage)
	return api
}

func (a *API) Start() error {
	return a.app.Listen(fmt.Sprintf(":%d", a.dep.Config.Port))
}

func (a *API) Stop() {
	a.app.Shutdown()
}
