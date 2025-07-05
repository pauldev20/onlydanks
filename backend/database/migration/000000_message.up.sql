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

CREATE TABLE message.blob_update (
  block_height BIGINT NOT NULL
);

CREATE TABLE message.ens_subdomain (
  subdomain VARCHAR(255) PRIMARY KEY,
  address VARCHAR(255) NOT NULL,
  UNIQUE (subdomain, address)
);

