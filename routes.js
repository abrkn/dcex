const routes = (module.exports = require('next-routes')());

routes
  .add('block', '/blocks/:hash', 'block')
  .add('tx', '/txs/:txId', 'tx')
  .add('address', '/addresses/:address', 'address')
  .add('blindhash', '/blindhash/:blindHash', 'blindhash');
