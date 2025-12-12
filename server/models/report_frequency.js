const pool = require('../src/config/database');

const findAll = async () => {
  const result = await pool.query('SELECT * FROM report_frequency ORDER BY farmer_id');
  return result.rows;
};

const findByFarmerId = async (farmerId) => {
  const result = await pool.query('SELECT * FROM report_frequency WHERE farmer_id=$1', [farmerId]);
  return result.rows[0];
};

const create = async (reportFrequency) => {
  const {farmer_id, frequency} = reportFrequency;
  await pool.query(
    'INSERT INTO report_frequency (farmer_id, frequency) VALUES ($1, $2)',
    [farmer_id, frequency]
  );
};

const update = async (farmerId, reportFrequency) => {
  const {frequency} = reportFrequency;
  await pool.query(
    'UPDATE report_frequency SET frequency=$1 WHERE farmer_id=$2',
    [frequency, farmerId]
  );
};

const deleteByFarmerId = async (farmerId) => {
  await pool.query('DELETE FROM report_frequency WHERE farmer_id=$1', [farmerId]);
};

module.exports = {
  findAll,
  findByFarmerId,
  create,
  update,
  deleteByFarmerId
};