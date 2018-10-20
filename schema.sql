-- TODO: synthetic ids to reduce storage

do $SCHEMA$
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
    if (select schema_version from settings) = 7 then
      return;
    end if;
  end if;

  drop trigger if exists vin_insert on vin;
  drop function if exists vin_insert();
  drop table if exists vout;
  drop table if exists vin;
  drop table if exists tx;
  drop table if exists block;
  drop table if exists settings;

  create table settings (
    schema_version int not null default(7)
  );

  insert into settings default values;

  create table block (
    hash text primary key,
    height int not null check (height >= 0)
  );

  create table tx (
    tx_id text primary key,
    hash text not null unique,
    block_hash text not null references block(hash) on delete cascade,
    n int not null,
    unique (block_hash, n)
  );

  create table vin (
    tx_id text not null references tx(tx_id) on delete cascade,
    n int check(n >= 0),
    coinbase text,
    prev_tx_id text,
    vout int,
    script_sig jsonb,
    value numeric,
    primary key (tx_id, n),
    check ((
      coinbase is null and
      prev_tx_id is not null and
      vout is not null
    ) or (
      coinbase is not null and
      prev_tx_id is null and
      vout is null
    ))
  );

  create table vout (
    tx_id text not null references tx(tx_id) on delete cascade,
    n int check(n >= 0),
    script_pub_key jsonb,
    value numeric not null
  );

  create function vin_insert() returns trigger as $$
  begin
    if new.tx_id is not null then
      select value
      from vout
      into new.value
      where vout.tx_id = new.tx_id and vout.n = new.n;
    end if;

    return new;
  end; $$ language plpgsql;

  create trigger vin_insert
  before insert on vin
  for each row
  execute procedure vin_insert();
end; $SCHEMA$ language plpgsql;
