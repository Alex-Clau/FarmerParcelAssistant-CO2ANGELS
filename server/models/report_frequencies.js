const pool = require('../src/config/database');

const findAll = async () => {
  const result = await pool.query('SELECT * FROM report_frequency ORDER BY farmer_id');
  return result.rows;
};

const findByFarmerId = async (farmerId) => {
  const result = await pool.query('SELECT * FROM report_frequency WHERE farmer_id=$1', [farmerId]);
  return result.rows[0];
};

const findAllDue = async (date) => {
  const result = await pool.query(
    `SELECT rf.*, pl.phone 
     FROM report_frequency rf
     JOIN phone_link pl ON rf.farmer_id = pl.farmer_id
     WHERE rf.next_report <= $1`,
    [date]
  );
  return result.rows;
};

const create = async (reportFrequency) => {
  const {farmer_id, frequency, next_report} = reportFrequency;
  await pool.query(
    'INSERT INTO report_frequency (farmer_id, frequency, next_report) VALUES ($1, $2, $3)',
    [farmer_id, frequency, next_report]
  );
};

const update = async (farmerId, reportFrequency) => {
  const {frequency, next_report} = reportFrequency;
  await pool.query(
    'UPDATE report_frequency SET frequency=$1, next_report=$2 WHERE farmer_id=$3',
    [frequency, next_report, farmerId]
  );
};

const deleteByFarmerId = async (farmerId) => {
  await pool.query('DELETE FROM report_frequency WHERE farmer_id=$1', [farmerId]);
};

module.exports = {
  findAll,
  findByFarmerId,
  findAllDue,
  create,
  update,
  deleteByFarmerId
};