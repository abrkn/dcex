-- TODO: synthetic ids to reduce storage

do $$
declare
  settings_table_exists bool;
begin
  settings_table_exists := (select exists ( SELECT 1
   FROM   pg_catalog.pg_class c
   JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  --  WHERE  n.nspname = 'schema_name'
   AND    c.relname = 'settings'
   AND    c.relkind = 'r'    -- only tables
   ));

  if settings_table_exists then
    if (select schema_version from settings) = 3 then
      return;
    end if;
  end if;


  drop table if exists vout;
  drop table if exists vin;
  drop table if exists tx;
  drop table if exists block;
  drop table if exists settings;

  create table settings (
    schema_version int not null default(3)
  );

  insert into settings default values;

  create table block (
    hash text primary key,
    height int not null check (height >= 0)
  );

  create table tx (
    hash text primary key,
    block_hash text not null references block(hash) on delete cascade,
    n int not null,
    unique (block_hash, n)
  );

  create table vin (
    tx_hash text not null references tx(hash) on delete cascade,
    n int check(n >= 0),
    coinbase text,
    txid text,
    vout int,
    script_sig jsonb,
    primary key (tx_hash, n),
    check ((
      coinbase is null and
      txid is not null and
      vout is not null
    ) or (
      coinbase is not null and
      txid is null and
      vout is null
    ))
  );

  create table vout (
    tx_hash text not null references tx(hash) on delete cascade,
    n int check(n >= 0),
    script_pub_key jsonb,
    value bigint not null
  );
end; $$ language plpgsql;
