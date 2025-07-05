CONTAINER_NAME = devdb
DB_NAME = intra
DB_PORT = 5432
DB_USER = postgres
DB_PASS = password

DB_URL = postgresql://$(DB_USER):$(DB_PASS)@$(CONTAINER_NAME):$(DB_PORT)/$(DB_NAME)?sslmode=disable

-include .env
export

default:
	@echo "docker_postgres up down create drop reset"

up:
	docker run --rm \
		--network devdbnetwork \
		-v $(PWD)/migration:/migration \
		-e DB_URL=$(DB_URL) \
		migrate/migrate -path=/migration -database $(DB_URL) up

down:
	docker run --rm \
		--network devdbnetwork \
		-v $(PWD)/migration:/migration \
		-e DB_URL=$(DB_URL) \
		migrate/migrate -path=/migration -database $(DB_URL) down 1

create:
	docker run --rm \
		--network devdbnetwork \
		-e PGPASSWORD=$(DB_PASS) \
		postgres:17 \
		createdb -h $(CONTAINER_NAME) -p $(DB_PORT) -U $(DB_USER) --no-password $(DB_NAME)

drop:
	docker run --rm \
		--network devdbnetwork \
		-e PGPASSWORD=$(DB_PASS) \
		postgres:17 \
		dropdb -h $(CONTAINER_NAME) -p $(DB_PORT) -U $(DB_USER) --no-password $(DB_NAME)

reset: drop create up


reset-dev: 
	@[ -n "${DEV_DB_URL}" ] || { echo "set DEV_DB_URL"; exit 1; }
	docker run --rm postgres:17 psql $(DEV_DB_URL)/postgres -c "DO \$$\$$ BEGIN PERFORM pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$(DB_NAME)'; END \$$\$$;"
	-docker run --rm postgres:17 psql $(DEV_DB_URL)/postgres -c "DROP DATABASE $(DB_NAME)"
	docker run --rm postgres:17 psql $(DEV_DB_URL)/postgres -c "CREATE DATABASE $(DB_NAME)"
	docker run --rm \
			-v $(PWD)/migration:/migration \
			migrate/migrate -path=/migration -database $(DEV_DB_URL)/$(DB_NAME)?sslmode=disable up
	cat fill_dev_database.sql | docker run -i --rm postgres:17 psql $(DEV_DB_URL)/$(DB_NAME)

docker:
	-docker network create devdbnetwork
	docker run --rm --network devdbnetwork --name $(CONTAINER_NAME) -e POSTGRES_PASSWORD=$(DB_PASS) -e POSTGRES_USER=$(DB_USER) -p $(DB_PORT):$(DB_PORT) -d postgres:17.2

.PHONY: default up down create drop reset docker
