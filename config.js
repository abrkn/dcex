const { POSTGRES_SSL, DATABASE_URL } = process.env;

exports.postgresSsl = !!+POSTGRES_SSL;
exports.databaseUrl = exports.postgresSsl ? DATABASE_URL + '?ssl=true' : DATABASE_URL;
