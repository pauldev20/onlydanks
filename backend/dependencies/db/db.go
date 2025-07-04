package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	db *pgxpool.Pool
}

func Database(connString string) (*DB, error) {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, err
	}

	dbpool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, err
	}

	con, err := dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer con.Release()

	err = con.Ping(context.Background())
	if err != nil {
		return nil, err
	}
	return &DB{db: dbpool}, nil
}

func (db *DB) Pool() *pgxpool.Pool {
	return db.db
}
