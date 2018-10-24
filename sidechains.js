const SIDECHAIN_ONE = {
  number: 0,
  keyId: '51c6eb4891cbb94ca30518b5f8441ea078c849eb',
  privateKey: 'L4nNEPEuYwNaKMj1RZVsAuXPq5xbhdio43dTRzAr5CZgQHrSpFU8',
  publicKey: '76a91451c6eb4891cbb94ca30518b5f8441ea078c849eb88ac',
  name: 'Sidechain One',
};

const SIDECHAIN_PAYMENT = {
  number: 1,
  keyId: '7c33a3f6d9d5b873f96dba4b12d6aaf6be71fbd2',
  privateKey: 'L3UjtLhNXKZaDgFtf14EHkxV1p5CKUoyRUT5DcU7aUS1X2yX8hhg',
  publicKey: '76a9147c33a3f6d9d5b873f96dba4b12d6aaf6be71fbd288ac',
  name: 'Payment Sidechain',
};

const sidechains = {
  [SIDECHAIN_ONE.number]: SIDECHAIN_ONE,
  [SIDECHAIN_PAYMENT.number]: SIDECHAIN_PAYMENT,
};

Object.assign(exports, sidechains, {
  SIDECHAIN_ONE,
  SIDECHAIN_PAYMENT,
});
