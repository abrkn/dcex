const assert = require('assert');
const { URL } = require('url');
const express = require('express');
const next = require('next');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
const bitcoin = require('bitcoin');
const safync = require('./safync');
const pMap = require('p-map');
const { rangeRight } = require('lodash');
const routes = require('./routes');
const pgp = require('pg-promise');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const port = +(process.env.PORT || 3000);
const app = next({ dev });
const handler = routes.getRequestHandler(app);
// const handle = app.getRequestHandler();

function urlToBitcoinOptions(url) {
  return {
    host: url.hostname || 'localhost',
    port: url.port,
    user: url.username || 'user',
    pass: url.password,
  };
}

const { BITCOIND_RPC_URL, DATABASE_URL } = process.env;

const bitcoinRpc = new bitcoin.Client(urlToBitcoinOptions(new URL(BITCOIND_RPC_URL)));
safync.applyTo(bitcoinRpc, 'cmd');

const db = pgp()(DATABASE_URL);

// GraphQL schema
var schema = buildSchema(`
    type Query {
      blockByHash(hash: String!): Block
      blockByHeight(height: Int!): Block
      blocks: [Block!]
      blockCount: Int!
      txByHash(hash: String!): Tx
    },
    type TxInput {
      vout: Int
      txid: String
      coinbase: String
    },
    type TxOutput {
      n: Int
      value: Float!
      addresses: [String]
    },
    type Tx {
      hash: String!
      inputs: [TxInput]
      outputs: [TxOutput]
      blockHash: String
    },
    type Block {
      hash: String!
      height: Int
      txs: [Tx]
    }
`);

// await bitcoinRpc.cmdAsync('getblockhash', height);

const formatTxInputFromRpc = vin => {
  const { vout, txid, coinbase } = vin;
  return { vout, txid, coinbase };
};

const formatTxOutputFromRpc = vout => {
  const { n, value, scriptPubKey } = vout;
  const { addresses } = scriptPubKey || {};

  // console.log(vout);

  return {
    n,
    value,
    addresses,
  };
};

const formatTxFromRpc = tx => {
  const { version, size, locktime, vin, vout, blockhash } = tx;
  const hash = tx.hash || tx.txid;

  return {
    hash,
    size,
    locktime,
    version,
    inputs: vin.map(formatTxInputFromRpc),
    outputs: vout.map(formatTxOutputFromRpc),
    blockHash: blockhash,
  };
};

const formatTxFromDb = tx => {
  return {
    hash: tx.hash,
    inputs: [], // TODO: Rename to vin
    outputs: [], // TODO: Rename vout
  };
};

// Root resolver
var root = {
  blockByHash: async ({ hash, includeTxs = true }) => {
    const block = await db.oneOrNone(`select hash, height from block where hash = $/hash/`, { hash });

    if (!block) {
      console.log('OMG THERES NO BLOCK WITB HASH', hash);
      console.log('OMG THERES NO BLOCK WITB HASH', hash);
      console.log('OMG THERES NO BLOCK WITB HASH', hash);
      console.log('OMG THERES NO BLOCK WITB HASH', hash);
      console.log('OMG THERES NO BLOCK WITB HASH', hash);
      console.log('OMG THERES NO BLOCK WITB HASH', hash);
      console.log('OMG THERES NO BLOCK WITB HASH', hash);
      return null;
    }

    console.log('KAP!');

    return {
      hash: block.hash,
      height: block.height,
      txs: await root.txsByBlock({ hash }),
    };
  },
  txsByBlock: async ({ hash }) => {
    const txs = await db.any(`select hash from tx where block_hash = $/hash/ order by n asc`, { hash });

    console.log({ txs });

    return txs.map(formatTxFromDb);
  },
  txByHash: async ({ hash }) => {
    const tx = await db.oneOrNone(`select hash from tx where hash = $/hash/`, { hash });

    if (!tx) {
      return null;
    }

    return formatTxFromDb(tx);
  },
  blockByHeight: async ({ height, includeTxs = true }) => {
    const row = await db.oneOrNone(`select hash from block where height = $/height/`, { height });

    if (!row) {
      return null;
    }

    return root.blockByHash({ hash: row.hash });
  },
  blockCount: () => db.one('select coalesce(max(height), 0) height from block').then(_ => _.height),
  blocks: async () => {
    const MAX_COUNT = 10;

    const count = await root.blockCount();
    const heights = rangeRight(count - MAX_COUNT + 1, count + 1);

    // console.log({ count, heights });

    return pMap(heights, height => root.blockByHeight({ height, includeTxs: false }));
  },
};

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(
      '/graphql',
      express_graphql({
        schema: schema,
        rootValue: root,
        graphiql: true,
      })
    );

    server.use(handler);

    // server.get('*', (req, res) => {
    //   return handle(req, res);
    // });

    server.listen(port, err => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000 !');
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
