const { Pool } = require('pg')

const { logger } = require('../logger')
const {
  db: {
    host,
    port,
    user,
    password,
    database,
  }
} = require('../configs')

const pool = new Pool({
  user,
  host,
  database,
  password,
  port,
})

let connected = false;

const connect = async () => {
  while (!connected) {
    logger.info('Try connect to db');
    try {
      await pool.connect();
      connected = true;
    } catch (err) {
      logger.error(err.message);
      logger.info('Connection to db failed, reconnect.');
    };
  }
}

connect();

pool.query('SELECT NOW()')
  .then(res => {
    logger.info(`db connected`)
  })
  .catch(err => {
    logger.error(err.message)
  })

const cleanUp = () => {
  pool.end(() => {
    logger.info('pool has ended')
  })
}

module.exports = {
  pool,
  cleanUp,
}