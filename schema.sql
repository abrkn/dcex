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

  -- if false and settings_table_exists then
  if settings_table_exists then
    if (select schema_version from settings) = 32 then
      return;
    end if;
  end if;

  drop function if exists get_address_txs(address text);
  drop view if exists address_tx;
  drop view if exists tx_view;
  drop view if exists sent_by_address;
  drop view if exists received_by_address;
  drop trigger if exists vin_delete on vin;
  drop function if exists vin_delete();
  drop trigger if exists vin_insert on vin;
  drop function if exists vin_insert();
  drop table if exists vout;
  drop table if exists vin;
  drop table if exists tx;
  drop table if exists block;
  drop table if exists settings;

  create table settings (
    schema_version int not null default(32)
  );

  insert into settings default values;

  create table block (
    hash text primary key,
    blindhash text,
    height int not null check (height >= 0),
    time timestamptz not null
  );

  create table tx (
    tx_id text primary key,
    hash text not null unique,
    block_hash text not null references block(hash) on delete cascade,
    n int not null,
    locktime int not null,
    version int not null,
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
    address text,
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
    value numeric not null,
    spending_tx_id text,
    spending_n int
  );

  create function vin_insert() returns trigger as $$
  begin
    if new.tx_id is not null then
      select
        value,
        (jsonb_array_elements(vout.script_pub_key->'addresses')->>0)::text address
      from vout
      into new.value, new.address
      where vout.tx_id = new.prev_tx_id and vout.n = new.vout;

      -- Mark output as spent
      update vout
      set spending_tx_id = new.tx_id, spending_n = new.n
      where vout.tx_id = new.prev_tx_id and vout.n = new.vout;
    end if;

    return new;
  end; $$ language plpgsql;

  create trigger vin_insert
  before insert on vin
  for each row
  execute procedure vin_insert();

  create function vin_delete() returns trigger as $$
  begin
    if old.tx_id is not null then
      -- Mark output as no longer spent
      update vout
      set spending_tx_id = null, spending_n = null
      where vout.tx_id = old.prev_tx_id and vout.n = old.vout;
    end if;

    return old;
  end; $$ language plpgsql;

  create trigger vin_delete
  before delete on vin
  for each row
  execute procedure vin_delete();

  create view received_by_address as
  select
      vout.tx_id,
      vout.n,
      vout.value,
      (jsonb_array_elements(vout.script_pub_key->'addresses')->>0)::text address,
      block.time
  from vout
  inner join tx on tx.tx_id = vout.tx_id
  inner join block on block.hash = tx.block_hash
  where
      vout.script_pub_key is not null and
      vout.script_pub_key->'addresses' is not null;

  create view sent_by_address as
  select vin.*, block.time
  from vin
  inner join tx on tx.tx_id = vin.tx_id
  inner join block on block.hash = tx.block_hash
  where vin.address is not null;

  create view tx_view as
  select tx.*, block.time
  from tx
  inner join block on block.hash = tx.block_hash;

  create view address_tx as
  select tx.*, t.address, t.time
  from
  (
      select tx_id, time, address
      from received_by_address
      union
      select tx_id, time, address
      from sent_by_address
  ) t
  inner join tx on tx.tx_id = t.tx_id;

  create function get_address_txs(_address text) returns setof tx as $$
    select tx.*
    from address_tx
    inner join tx on tx.tx_id = address_tx.tx_id
    where address_tx.address = _address
    order by address_tx.time desc, tx.n asc;
  $$ language sql stable;
end; $SCHEMA$ language plpgsql;
