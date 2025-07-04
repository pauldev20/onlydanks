package main

import (
	"os"
	"os/signal"
	"proto-dankmessaging/backend/api"
	"proto-dankmessaging/backend/dependencies"
	"proto-dankmessaging/backend/dependencies/config"
	"runtime/debug"
	"sync"
	"syscall"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	dep, err := dependencies.NewDependencies()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create dependencies")
	}
	setupLogger(dep.Config)

	wg := sync.WaitGroup{}
	api := startAPI(&wg, dep)
	log.Info().Msg("server running")
	gracefulShutdown(api, &wg)
}

func startAPI(
	wg *sync.WaitGroup,
	dep *dependencies.Dependencies,
) *api.API {
	wg.Add(1)
	api := api.NewAPI()
	go func() {
		defer wg.Done()
		err := api.Start()
		if err != nil {
			log.Fatal().Err(err).Msg("failed to start api")
		}
	}()
	return api
}

func gracefulShutdown(
	api *api.API,
	wg *sync.WaitGroup,
) {
	sigChannel := make(chan os.Signal, 1)
	signal.Notify(sigChannel, os.Interrupt, syscall.SIGTERM)
	<-sigChannel

	log.Warn().Msg("shutting down gracefully, press Ctrl+C again to force")
	done := make(chan bool)
	go func() {
		api.Stop()
		wg.Wait()
		close(done)
	}()
	select {
	case <-done:
		log.Warn().Msg("All services stopped.")
	case <-sigChannel:
		log.Error().Msg("Force quitting.")
	}
}

func setupLogger(c *config.Config) {
	loglevel, err := zerolog.ParseLevel(string(c.LogLevel))
	if err != nil {
		log.Fatal().Err(err).Msg("invalid log level")
	}
	zerolog.ErrorStackMarshaler = func(err error) interface{} {
		debug.PrintStack()
		return err.Error()
	}
	zerolog.SetGlobalLevel(loglevel)
	log.Logger = log.With().Caller().Logger()
	if c.LogType == "plain" {
		log.Logger = log.Logger.Output(
			//exhaustruct:ignore
			zerolog.ConsoleWriter{Out: os.Stderr},
		)
	}
}
