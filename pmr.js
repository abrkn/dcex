const { createHash } = require('crypto');

function pMemoize(fn, options = {}) {
  const { cache } = options;

  return async function(...args) {
    const key = createHash('sha256')
      .update(args.length ? JSON.stringify(args) : '')
      .digest('hex');

    const exists = await cache.has(key);

    if (exists) {
      // TODO: max age
      // console.log('cache hit');
      return await cache.get(key);
    }

    // console.log('cache miss');

    const value = await fn(...args);

    await cache.set(key, { data: value });

    return value;
  };
}

exports.pMemoize = pMemoize;
