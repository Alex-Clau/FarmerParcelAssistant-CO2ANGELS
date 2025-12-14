const pool = require('../src/config/database');

const findAll = async () => {
  const result = await pool.query('SELECT * FROM farmers ORDER BY id');
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query('SELECT * FROM farmers WHERE id=$1', [id]);
  return result.rows[0];
};

const findByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM farmers WHERE username=$1', [username]);
  return result.rows[0];
};

const findByPhone = async (phone) => {
  const result = await pool.query('SELECT * FROM farmers WHERE phone=$1', [phone]);
  return result.rows[0];
};

const create = async (farmer) => {
  const {id, username, name, phone} = farmer;
  await pool.query(
    'INSERT INTO farmers (id, username, name, phone) VALUES ($1, $2, $3, $4)',
    [id, username, name, phone]
  );
};

const update = async (id, farmer) => {
  const {username, name, phone} = farmer;
  await pool.query(
    'UPDATE farmers SET username=$1, name=$2, phone=$3 WHERE id=$4',
    [username, name, phone, id]
  );
};

const deleteById = async (id) => {
  await pool.query(
    'DELETE FROM farmers WHERE id=$1',
    [id]
  );
};

module.exports = {
  findAll,
  findById,
  findByUsername,
  findByPhone,
  create,
  update,
  deleteById
};