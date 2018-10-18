const routes = (module.exports = require('next-routes')());

routes.add('block', '/blocks/:hash', 'block').add('tx', '/txs/:hash', 'tx');
// .add('about')
// .add('blog', '/blog/:slug')
// .add('user', '/user/:id', 'profile')
// .add('/:noname/:lang(en|es)/:wow+', 'complex')
// .add({ name: 'beta', pattern: '/v3', page: 'v3' });
