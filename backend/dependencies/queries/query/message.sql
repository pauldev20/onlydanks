-- name: AddPubkey :one
INSERT INTO message.pubkey (pubkey, submit_time) VALUES ($1, $2) 
ON CONFLICT (pubkey) DO UPDATE SET submit_time = EXCLUDED.submit_time 
RETURNING *;

-- name: GetPubkeysSince :many
SELECT * FROM message.pubkey WHERE submit_time > $1 LIMIT 1000;

-- name: AddMessage :one
INSERT INTO message.message (index, message, submit_time) VALUES ($1, $2, $3) 
ON CONFLICT (index, message) DO UPDATE SET submit_time = EXCLUDED.submit_time 
RETURNING *;

-- name: GetMessagesByIndex :many
SELECT * FROM message.message WHERE index = $1;