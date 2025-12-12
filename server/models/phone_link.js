const pool = require('../src/config/database');

const findAll = async () => {
  const result = await pool.query('SELECT * FROM phone_link ORDER BY phone');
  return result.rows;
};

const findByPhone = async (phone) => {
  const result = await pool.query('SELECT * FROM phone_link WHERE phone=$1', [phone]);
  return result.rows[0];
};

const findByFarmerId = async (farmerId) => {
  const result = await pool.query('SELECT * FROM phone_link WHERE farmer_id=$1', [farmerId]);
  return result.rows;
};

const create = async (phoneLink) => {
  const {phone, farmer_id} = phoneLink;
  await pool.query(
    'INSERT INTO phone_link (phone, farmer_id) VALUES ($1, $2)',
    [phone, farmer_id]
  );
};

const update = async (phone, phoneLink) => {
  const {farmer_id} = phoneLink;
  await pool.query(
    'UPDATE phone_link SET farmer_id=$1 WHERE phone=$2',
    [farmer_id, phone]
  );
};

const deleteByPhone = async (phone) => {
  await pool.query('DELETE FROM phone_link WHERE phone=$1', [phone]);
};

module.exports = {
  findAll,
  findByPhone,
  findByFarmerId,
  create,
  update,
  deleteByPhone
};