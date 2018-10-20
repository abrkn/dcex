const assert = require('assert');
const { URL } = require('url');
const express = require('express');
const next = require('next');
// var express_graphql = require('express-graphql');
// var { buildSchema } = require('graphql');
const bitcoin = require('bitcoin');
const safync = require('./safync');
const pMap = require('p-map');
const { rangeRight } = require('lodash');
const routes = require('./routes');
const pgp = require('pg-promise');
const postgraphile = require('postgraphile');
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
// var schema = buildSchema(`
//     type Query {
//       blockByHash(hash: String!): Block
//       blockByHeight(height: Int!): Block
//       blocks: [Block!]
//       blockCount: Int!
//       txByHash(hash: String!): Tx
//     },
//     type TxInput {
//       vout: Int
//       txid: String
//       coinbase: String
//     },
//     type TxOutput {
//       n: Int
//       value: Float!
//       addresses: [String]
//     },
//     type Tx {
//       hash: String!
//       vin: [TxInput]
//       vout: [TxOutput]
//       blockHash: String
//     },
//     type Block {
//       hash: String!
//       height: Int
//       txs: [Tx]
//     }
// `);

const formatTxFromDb = tx => {
  return {
    hash: tx.hash,
  };
};

// Root resolver
var root = {
  blockByHash: async ({ hash, includeTxs = true }) => {
    const block = await db.oneOrNone(`select hash, height from block where hash = $/hash/`, { hash });

    if (!block) {
      return null;
    }

    return {
      hash: block.hash,
      height: block.height,
      txs: await root.txsByBlock({ hash }),
    };
  },
  vinByTx: async ({ hash }) => {
    const vin = await db.any(`select * from vin where tx_hash = $/hash/ order by n asc`, { hash });

    return vin.map(_ => ({
      txHash: _.tx_hash,
      n: _.n,
      coinbase: _.coinbase,
      txid: _.txid,
      vout: _.vout,
      scriptSig: _.script_sig,
    }));
  },
  voutByTx: async ({ hash }) => {
    const vout = await db.any(`select * from vout where tx_hash = $/hash/ order by n asc`, { hash });

    return vout.map(_ => ({
      txHash: _.tx_hash,
      n: _.n,
      scriptPubKey: _.script_pub_key,
      value: _.value,
    }));
  },
  txsByBlock: async ({ hash }) => {
    const txs = await db.any(`select hash from tx where block_hash = $/hash/ order by n asc`, { hash });

    return pMap(txs, tx => root.txByHash({ hash: tx.hash }));
  },
  txByHash: async (...args) => {
    console.log({ args });
    const [{ hash }] = args;

    const tx = await db.oneOrNone(`select hash from tx where hash = $/hash/`, { hash });

    if (!tx) {
      return null;
    }

    return {
      ...formatTxFromDb(tx),
      vin: await root.vinByTx({ hash }),
      vout: await root.voutByTx({ hash }),
    };
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

    return pMap(heights, height => root.blockByHeight({ height, includeTxs: false }));
  },
};

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(
      postgraphile.default(process.env.DATABASE_URL, 'public', {
        watchPg: process.env.NODE_ENV !== 'production',
        graphiql: true,
      })
    );

    // server.use(
    //   '/graphql',
    //   express_graphql({
    //     schema: schema,
    //     rootValue: root,
    //     graphiql: true,
    //   })
    // );

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
