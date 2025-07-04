package dependencies

import (
	"errors"
	"proto-dankmessaging/backend/dependencies/config"
	"proto-dankmessaging/backend/dependencies/db"
)

type Dependencies struct {
	Config *config.Config
	DB     *db.DB
}

func NewDependencies() (*Dependencies, error) {
	c, err := config.NewConfig()
	if err != nil {
		return nil, err
	}

	db, err := db.Database(c.Database)
	if err != nil {
		return nil, errors.New("failed to create db: " + err.Error())
	}

	return &Dependencies{
		Config: c,
		DB:     db,
	}, nil
}
