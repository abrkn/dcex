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

Promise.promisifyAll(redis);

const { BITCOIND_RPC_URL, REDIS_URL, DATABASE_URL } = process.env;

const bitcoinRpc = new bitcoin.Client(urlToBitcoinOptions(new URL(BITCOIND_RPC_URL)));
safync.applyTo(bitcoinRpc, 'cmd');

const memBitcoinRpcCmdAsync = pMemoize(bitcoinRpc.cmdAsync, { cache: createRedisMemCache(REDIS_URL, 'drivenetRpc') });

function* applyVout(t, block, tx, vout, index) {
  yield t.none(`insert into vout (tx_hash, n, script_pub_key) values ($/txHash/, $/n/, $/scriptPubKey/)`, {
    txHash: tx.hash,
    n: index,
    scriptPubKey: vout.scriptPubKey,
  });
}

function* applyVin(t, block, tx, vin, index) {
  yield t.none(
    `insert into vin (tx_hash, n, coinbase, txid, vout, script_sig) values ($/txHash/, $/n/, $/coinbase/, $/txid/, $/vout/, $/scriptSig/)`,
    {
      txHash: tx.hash,
      n: index,
      coinbase: vin.coinbase ? vin.coinbase : null,
      txid: vin.txid,
      vout: vin.vout,
      scriptSig: vin.scriptSig,
    }
  );
}

function* applyTx(t, block, tx, index) {
  yield t.none(`insert into tx (hash, block_hash, n) values ($/hash/, $/blockHash/, $/index/)`, {
    hash: tx.hash,
    blockHash: block.hash,
    index,
  });

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

  const db = pgp()(DATABASE_URL);

  const tick = async () => {
    let { height: localHeight } = await db.one('select coalesce(max(height), -1) height from block');
    const { blocks: remoteHeight } = await bitcoinRpc.cmdAsync('getblockchaininfo');
    // console.log({ localHeight, remoteHeight });

    for (; localHeight >= 0; localHeight--) {
      const { hash: localHash } = await db.one(`select hash from block where height = $/localHeight/`, {
        localHeight,
      });

      const remoteHash = await bitcoinRpc.cmdAsync('getblockhash', localHeight);

      // console.log({ localHeight, localHash, remoteHash });

      // TODO: Remove this
      const rewindRandomly = Math.random() > 0.25;

      if (rewindRandomly) {
        console.log('**TESTING** Will rewind randomly');
      }

      if (!rewindRandomly && localHash === remoteHash) {
        break;
      }

      console.log(`Reorg detected. Undoing block at height ${localHeight}`);

      await db
        .result(`delete from block where height = $/height/`, { height: localHeight })
        .then(_ => assert.equal(_.rowCount, 1));

      // process.exit(1);
    }

    // console.log({ localHeight, remoteHeight });

    let blocksAppended = 0;

    for (localHeight++; localHeight <= remoteHeight; localHeight++) {
      console.log('Appending block at height', localHeight);

      const blockHash = await bitcoinRpc.cmdAsync('getblockhash', localHeight);
      // console.log({ localHeight, blockHash });
      const block = await memBitcoinRpcCmdAsync('getblock', blockHash, 2);

      await db.tx(t => t.batch(Array.from(applyBlock(t, block))));

      // TODO: Remove this
      if (++blocksAppended > 10) {
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
