CREATE SCHEMA message;

CREATE TABLE message.blob (
  id SERIAL PRIMARY KEY,
  index BYTEA NOT NULL,
  message BYTEA NOT NULL,
  submit_time TIMESTAMP NOT NULL,
  needs_submission BOOLEAN NOT NULL,
  UNIQUE (index, message)
);

CREATE TABLE message.pubkey (
  pubkey BYTEA PRIMARY KEY,
  submit_time TIMESTAMP NOT NULL
);

CREATE TABLE message.blob_submission (
  id SERIAL PRIMARY KEY,
  index BYTEA NOT NULL,
  message BYTEA NOT NULL,
  pubkey BYTEA NOT NULL,
  UNIQUE (index, message, pubkey)
);

