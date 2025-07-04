-- name: AddPubkey :one
INSERT INTO message.pubkey (pubkey, submit_time) VALUES ($1, $2) RETURNING *;

-- name: GetPubkeysSince :many
SELECT * FROM message.pubkey WHERE submit_time > $1;

-- name: AddMessage :one
INSERT INTO message.message (id, prefix, message, submit_time) VALUES ($1, $2, $3, $4) RETURNING *;

-- name: GetMessagesByPrefix :many
SELECT * FROM message.message WHERE prefix = $1;