// config/knexfile.js
import { POSTGRES_URL, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PORT, NODE_ENV } from './env.js';

const config = {
  development: {
    client: 'pg',
    connection: POSTGRES_URL || {
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DATABASE
    },
    migrations: {
      directory: './database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './database/seeds',
      extension: 'js'
    }
  }
};

export default config;