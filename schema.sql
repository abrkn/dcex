SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'TARGET_DB' -- ← change this to your DB
  AND pid <> pg_backend_pid();

create table block (
  hash bytea not null primary key,
  height int
);

create table tx (
  hash bytea not null primary key
);

create table block_tx (
  block_hash bytea not null references block(hash),
  tx_hash bytea not null references tx(hash),
  primary key (block_hash, tx_hash)
);
