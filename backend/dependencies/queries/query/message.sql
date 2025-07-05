-- name: AddPubkey :one
INSERT INTO message.pubkey (pubkey, submit_time) VALUES ($1, $2) 
ON CONFLICT (pubkey) DO UPDATE SET submit_time = EXCLUDED.submit_time 
RETURNING *;

-- name: GetPubkeysSince :many
SELECT * FROM message.pubkey WHERE submit_time > $1 LIMIT 1000;

-- name: AddMessage :one
INSERT INTO message.blob (index, message, submit_time, needs_submission) VALUES ($1, $2, $3, $4) 
ON CONFLICT (index, message) DO UPDATE SET submit_time = EXCLUDED.submit_time, needs_submission = EXCLUDED.needs_submission 
RETURNING *;

-- name: GetMessagesByIndex :many
SELECT * FROM message.blob WHERE index = $1;

-- name: AddBlobSubmission :one
INSERT INTO message.blob_submission (index, message, pubkey) VALUES ($1, $2, $3) 
ON CONFLICT (index, message, pubkey) DO NOTHING 
RETURNING *;

-- name: GetBlobSubmissions :many
SELECT * FROM message.blob_submission;

-- name: RemoveBlobSubmission :exec
DELETE FROM message.blob_submission WHERE id = $1;

-- name: SetBlobUpdate :exec
INSERT INTO message.blob_update (block_height) VALUES ($1);

-- name: UpdateBlobUpdate :exec
UPDATE message.blob_update SET block_height = $1;

-- name: GetBlobUpdate :one
SELECT * FROM message.blob_update LIMIT 1;

-- name: AddENSSubdomain :exec
INSERT INTO message.ens_subdomain (subdomain, address) VALUES ($1, $2);

-- name: GetENSSubdomainByAddress :one
SELECT * FROM message.ens_subdomain WHERE address = $1;


