#!/usr/bin/env node -r panik -r dotenv/config
const assert = require('assert');
const { URL } = require('url');
const redis = require('redis');
const bitcoin = require('bitcoin');
const safync = require('./safync');
const { urlToBitcoinOptions } = require('./utils');
const Promise = require('bluebird');
const { pMemoize } = require('./pmr');
const pgp = require('pg-promise');
const createRedisMemCache = require('p-memoize-redis');
const delay = require('delay');
const config = require('./config');

Promise.promisifyAll(redis);

const { BITCOIND_RPC_URL, REDIS_URL } = process.env;

const bitcoinRpc = new bitcoin.Client(urlToBitcoinOptions(new URL(BITCOIND_RPC_URL)));
safync.applyTo(bitcoinRpc, 'cmd');

const memBitcoinRpcCmdAsync = pMemoize(bitcoinRpc.cmdAsync, { cache: createRedisMemCache(REDIS_URL, 'drivenetRpc') });

function* applyVout(t, block, tx, vout, index) {
  yield t.none(`insert into vout (tx_id, n, script_pub_key, value) values ($/txId/, $/n/, $/scriptPubKey/, $/value/)`, {
    txId: tx.txid,
    n: index,
    scriptPubKey: vout.scriptPubKey,
    value: vout.value,
  });
}

function* applyVin(t, block, tx, vin, index) {
  yield t.none(
    `insert into vin (tx_id, n, coinbase, prev_tx_id, vout, script_sig) values ($/txId/, $/n/, $/coinbase/, $/prevTxId/, $/vout/, $/scriptSig/)`,
    {
      txId: tx.txid,
      n: index,
      coinbase: vin.coinbase ? vin.coinbase : null,
      prevTxId: vin.txid,
      vout: vin.vout,
      scriptSig: vin.scriptSig,
    }
  );
}

function* applyTx(t, block, tx, index) {
  yield t.none(
    `insert into tx (tx_id, hash, block_hash, n, locktime, version) values ($/id/, $/hash/, $/blockHash/, $/index/, $/locktime/, $/version/)`,
    {
      id: tx.txid,
      hash: tx.hash,
      blockHash: block.hash,
      index,
      locktime: tx.locktime,
      version: tx.version,
    }
  );

  for (let i = 0; i < tx.vin.length; i++) {
    const vin = tx.vin[i];
    yield* applyVin(t, block, tx, vin, i);
  }

  for (let i = 0; i < tx.vout.length; i++) {
    const vout = tx.vout[i];
    yield* applyVout(t, block, tx, vout, i);
  }
}

function* applyBlock(t, block) {
  yield t.none(`insert into block (hash, height) values ($/hash/, $/height/)`, {
    hash: block.hash,
    height: block.height,
  });

  for (let i = 0; i < block.tx.length; i++) {
    const tx = block.tx[i];
    yield* applyTx(t, block, tx, i);
  }
}

const main = async () => {
  // TODO: detect re-org
  console.log('Starting');

  const db = pgp()(config.databaseUrl);

  const tick = async () => {
    let { height: localHeight } = await db.one('select coalesce(max(height), -1) height from block');
    const { blocks: remoteHeight } = await bitcoinRpc.cmdAsync('getblockchaininfo');

    console.log(`Ticking. Local height: ${localHeight}; remote height: ${remoteHeight}`);

    for (; localHeight >= 0; localHeight--) {
      const { hash: localHash } = await db.one(`select hash from block where height = $/localHeight/`, {
        localHeight,
      });

      const remoteHash = await bitcoinRpc.cmdAsync('getblockhash', localHeight);

      // TODO: Remove this
      const rewindRandomly = false && Math.random() > 0.25;

      if (rewindRandomly) {
        console.log('**TESTING** Will rewind randomly');
      }

      if (!rewindRandomly && localHash === remoteHash) {
        break;
      }

      console.log(`${localHeight}: Local hash (${localHash}) <> remote hash (${remoteHash})`);

      await db
        .result(`delete from block where height = $/height/`, { height: localHeight })
        .then(_ => assert.equal(_.rowCount, 1));

      // process.exit(1);
    }

    let blocksAppended = 0;

    for (localHeight++; localHeight <= remoteHeight; localHeight++) {
      console.log('Appending block at height', localHeight);

      const blockHash = await bitcoinRpc.cmdAsync('getblockhash', localHeight);
      const block = await memBitcoinRpcCmdAsync('getblock', blockHash, 2);

      await db.tx(t => t.batch(Array.from(applyBlock(t, block))));

      // TODO: Remove this
      if (false && ++blocksAppended > 10) {
        break;
      }
    }
  };

  while (true) {
    await tick();
    await delay(5e3);
  }
};

main().then(process.exit);
