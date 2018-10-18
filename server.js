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
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const port = +(process.env.PORT || 3000);
const app = next({ dev });
const handle = app.getRequestHandler();

function urlToBitcoinOptions(url) {
  return {
    host: url.hostname || 'localhost',
    port: url.port,
    user: url.username || 'user',
    pass: url.password,
  };
}

const { BITCOIND_RPC_URL } = process.env;

const bitcoinRpc = new bitcoin.Client(urlToBitcoinOptions(new URL(BITCOIND_RPC_URL)));
safync.applyTo(bitcoinRpc, 'cmd');

// GraphQL schema
var schema = buildSchema(`
    type Query {
      blockByHash(hash: String!): Block
      blockByHeight(height: Int!): Block
      blocks: [Block!]
      blockCount: Int!
    },
    type Block {
      hash: String!
      height: Int
    }
`);

// await bitcoinRpc.cmdAsync('getblockhash', height);

// Root resolver
var root = {
  blockByHash: ({ hash, includeTxs = true }) =>
    bitcoinRpc.cmdAsync('getblock', hash, includeTxs ? 2 : 1).then(_ => ({
      hash: _.hash,
      height: _.height,
    })),
  blockByHeight: ({ height, includeTxs = true }) =>
    bitcoinRpc.cmdAsync('getblockhash', height).then(hash => root.blockByHash({ hash, includeTxs })),
  blockCount: () => bitcoinRpc.cmdAsync('getblockcount'),
  blocks: async () => {
    const MAX_COUNT = 10;

    const count = await root.blockCount();
    const heights = rangeRight(count - MAX_COUNT + 1, count + 1);

    console.log({ count, heights });

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

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, err => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000 !');
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
