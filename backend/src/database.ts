import knex from 'knex';
import path from 'path';

const knexConfig = {
  client: process.env.DB_CLIENT || 'sqlite3',
  connection: process.env.DB_CLIENT === 'pg' ? {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  } : {
    filename: process.env.DB_CONNECTION || path.join(__dirname, '..', 'data', 'rescue_notes.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '..', 'migrations')
  }
};

export const db = knex(knexConfig);

export default db;