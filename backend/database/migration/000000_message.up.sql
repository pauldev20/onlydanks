CREATE SCHEMA message;

CREATE TABLE message.message (
  id SERIAL PRIMARY KEY,
  index VARCHAR(255) NOT NULL,
  message VARCHAR NOT NULL,
  submit_time TIMESTAMP NOT NULL,
  UNIQUE (index, message)
);

CREATE TABLE message.pubkey (
  pubkey VARCHAR(255) PRIMARY KEY,
  submit_time TIMESTAMP NOT NULL
);