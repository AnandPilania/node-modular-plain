const { connect } = require('../../core/database');
const { logger } = require('../../core/logger');

const excludeSensitiveFields = (item) => {
  delete item.password;
  delete item.deleted_at;
  return item;
};

const namespace = 'users.userRepository';
const tbl = 'users';

async function findAll() {
  const pool = await connect();
  const sql = `select * from ${tbl};`;
  try {
    const qr = await pool.query(sql);
    return qr.rows.map(excludeSensitiveFields);
  } catch (error) {
    logger.error(`${namespace}.findAll: ${error.message}`);
    throw error;
  }
}

async function insert(user) {
  const pool = await connect();
  console.log(`user`, user);
  const sql = `
    insert into ${tbl} (username, password, role, created_at)
    values ($1, $2, $3, now());`;
  const values = [user.username, user.password, user.role];
  try {
    const qr = await pool.query(sql, values);
    return qr.rows[0];
  } catch (error) {
    logger.error(`${namespace}.insert: ${error.message}`);
    throw error;
  }
}

async function findByUsername(username) {
  const pool = await connect();
  const sql = `select * from ${tbl} where username = $1 limit 1;`;
  const values = [username];

  try {
    const qr = await pool.query(sql, values);
    return qr.rows[0].map(excludeSensitiveFields);
  } catch (error) {
    logger.error(`${namespace}.findByUsername: ${error.message}`);
    throw error;
  }
}

module.exports = {
  findAll,
  findByUsername,
  insert,
};
