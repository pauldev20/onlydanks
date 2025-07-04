package main

import (
	"context"
	"os"
	"os/signal"
	"proto-dankmessaging/backend/api"
	"proto-dankmessaging/backend/blob"
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
	ctx, cancel := context.WithCancel(context.Background())

	b := blob.NewBlob(dep)
	startBlob(ctx, b, &wg)

	api := api.NewAPI(dep, b)
	startAPI(api, &wg)

	log.Info().Msg("server running")
	gracefulShutdown(api, cancel, &wg)
}

func startBlob(
	ctx context.Context,
	blob *blob.Blob,
	wg *sync.WaitGroup,
) {
	wg.Add(1)
	go func() {
		defer wg.Done()
		err := blob.Start(ctx)
		if err != nil {
			log.Fatal().Err(err).Msg("failed to start blob")
		}
		log.Info().Msg("blob stopped")
	}()
}

func startAPI(
	api *api.API,
	wg *sync.WaitGroup,
) {
	wg.Add(1)
	go func() {
		defer wg.Done()
		err := api.Start()
		if err != nil {
			log.Fatal().Err(err).Msg("failed to start api")
		}
		log.Info().Msg("api stopped")
	}()
}

func gracefulShutdown(
	api *api.API,
	cancel context.CancelFunc,
	wg *sync.WaitGroup,
) {
	sigChannel := make(chan os.Signal, 1)
	signal.Notify(sigChannel, os.Interrupt, syscall.SIGTERM)
	<-sigChannel

	log.Warn().Msg("shutting down gracefully, press Ctrl+C again to force")
	cancel()
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
			zerolog.ConsoleWriter{Out: os.Stderr},
		)
	}
}
