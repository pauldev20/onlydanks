package api

import (
	"fmt"
	"proto-dankmessaging/backend/dependencies"
	"proto-dankmessaging/backend/dependencies/queries/dbgen"
	"proto-dankmessaging/backend/ens"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type API struct {
	app     *fiber.App
	dep     *dependencies.Dependencies
	queries *dbgen.Queries
	ens     *ens.ENSWrapper
}

func NewAPI(dep *dependencies.Dependencies, ens *ens.ENSWrapper) *API {
	queries := dbgen.New(dep.DB.Pool())
	api := &API{
		app:     fiber.New(),
		dep:     dep,
		queries: queries,
		ens:     ens,
	}

	// Add CORS middleware to allow all origins
	api.app.Use(cors.New())

	api.app.Get("/keys", api.GetKeys)
	api.app.Get("/messages/:index", api.GetMessage)
	api.app.Post("/messages", api.PostMessage)
	api.app.Post("/ens", api.RegisterENS)
	return api
}

func (a *API) Start() error {
	return a.app.Listen(fmt.Sprintf(":%d", a.dep.Config.Port))
}

func (a *API) Stop() {
	a.app.Shutdown()
}
