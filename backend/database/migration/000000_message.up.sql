CREATE SCHEMA message;

CREATE TABLE message.message (
  id VARCHAR(255) PRIMARY KEY,
  prefix VARCHAR(255),
  message VARCHAR,
  submit_time TIMESTAMP
);

CREATE TABLE message.pubkey (
  pubkey VARCHAR(255) PRIMARY KEY,
  submit_time TIMESTAMP
);