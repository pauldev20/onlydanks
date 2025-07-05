// Package config loads the configuration from the environment and validates it
package config

import (
	"errors"
	"strings"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/v2"
)

type Environment string
type LogLevel string
type LogType string

const (
	EnvironmentDevelopment Environment = "development"
	EnvironmentStaging     Environment = "staging"
	EnvironmentProduction  Environment = "production"
)

const (
	LogLevelDebug LogLevel = "debug"
	LogLevelInfo  LogLevel = "info"
	LogLevelWarn  LogLevel = "warn"
	LogLevelError LogLevel = "error"
	LogLevelFatal LogLevel = "fatal"
	LogLevelPanic LogLevel = "panic"
)

const (
	LogTypeStructured LogType = "structured"
	LogTypePlain      LogType = "plain"
)

type Config struct {
	Environment Environment `koanf:"environment"  validate:"required,oneof=development staging production"`
	LogLevel    LogLevel    `koanf:"log_level"    validate:"required,oneof=trace debug info warn error fatal panic"`
	LogType     LogType     `koanf:"log_type"     validate:"required,oneof=structured plain"`
	Port        int         `koanf:"port"     validate:"required"`
	PrivateKey  string      `koanf:"private_key" validate:"required"`
	RpcUrl      string      `koanf:"rpc_url" validate:"required"`
	ChainId     uint64      `koanf:"chain_id" validate:"required"`
	BlobUpdate  bool        `koanf:"blob_update"`
	Database    string      `koanf:"database"                validate:"required,url"`
}

func NewConfig(envFiles ...string) (*Config, error) {
	k := koanf.New(".")

	godotenv.Load(envFiles...)
	k.Load(
		env.ProviderWithValue(
			"PDM_",
			"",
			func(key string, value string) (string, interface{}) {
				key = strings.TrimPrefix(key, "PDM_")
				key = strings.ToLower(key)
				return key, value
			},
		),
		nil,
	)

	var c Config
	err := k.Unmarshal("", &c)
	if err != nil {
		return nil, errors.New("failed to unmarshal config: " + err.Error())
	}
	if c.LogLevel == "" {
		c.LogLevel = LogLevelInfo
	}

	validate := validator.New()
	if err := validate.Struct(c); err != nil {
		return nil, errors.New(
			"Configuration validation failed: " + err.Error(),
		)
	}

	return &c, nil
}
