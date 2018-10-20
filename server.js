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

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(
      postgraphile.default(process.env.DATABASE_URL + '?sslmode=require', 'public', {
        watchPg: process.env.NODE_ENV !== 'production',
        graphiql: true,
        showErrorStack: true,
        extendedErrors: ['hint', 'detail', 'errcode'],
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
