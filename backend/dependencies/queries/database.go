package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Database(connString string) *pgxpool.Pool {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		log.Fatal(err)
	}

	dbpool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatal(err)
	}

	con, err := dbpool.Acquire(context.Background())
	defer con.Release()
	if err != nil {
		log.Fatal(err)
	}

	err = con.Ping(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	return dbpool
}
