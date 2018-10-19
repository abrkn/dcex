exports.urlToBitcoinOptions = function(url) {
  return {
    host: url.hostname || 'localhost',
    port: url.port,
    user: url.username || 'user',
    pass: url.password,
  };
};
