const withImages = require('next-images');

module.exports = withImages({
  publicRuntimeConfig: {
    CHAIN: process.env.CHAIN || 'drivenet',
  },
});
