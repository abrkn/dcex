const { URL } = require('url');
const createPgp = require('pg-promise');
const bitcoin = require('bitcoin');
const safync = require('./safync');

require('panik');
require('dotenv').config();

function urlToBitcoinOptions(url) {
  return {
    host: url.hostname || 'localhost',
    port: url.port,
    user: url.username || 'user',
    pass: url.password,
  };
}

function createPostgres() {
  const pgp = createPgp();
  const db = pgp(process.env.DATABASE_URL);
  return db;
}

const db = createPostgres();
const { BITCOIND_RPC_URL } = process.env;

const bitcoinRpc = new bitcoin.Client(urlToBitcoinOptions(new URL(BITCOIND_RPC_URL)));
safync.applyTo(bitcoinRpc, 'cmd');

const main = async () => {
  const fetchAndStoreBlockFromHeight = async height => {
    const hash = await bitcoinRpc.cmdAsync('getblockhash', height);
    console.log({ height, hash });

    const block = await bitcoinRpc.cmdAsync('getblock', hash, 2);
    console.log(block);

    await db.result('insert into block (hash, height) values ($/hash/, $/height/)', {
      hash: new Buffer(hash, 'hex'),
      height,
    });
  };

  const fetchAndStoreNewBlock = async () => {
    const { height: dbHeight } = await db.one('select max(height) height from block');
    const { blocks: rpcHeight } = await bitcoinRpc.cmdAsync('getblockchaininfo');

    console.log({ dbHeight, rpcHeight });

    if (dbHeight !== null && dbHeight >= rpcHeight) {
      return;
    }

    const height = dbHeight === null ? 0 : dbHeight + 1;

    await fetchAndStoreBlockFromHeight(height);

    return true;
  };

  const fetchAndStoreNewBlocks = async () => {
    while (await fetchAndStoreNewBlock()) {}
  };

  while (await fetchAndStoreNewBlocks()) {}
};

main().then(process.exit);
