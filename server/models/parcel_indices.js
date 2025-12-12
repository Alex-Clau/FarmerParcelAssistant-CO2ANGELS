const pool = require('../src/config/database');

const findAll = async () => {
  const result = await pool.query('SELECT * FROM parcel_indices ORDER BY parcel_id, date DESC');
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query('SELECT * FROM parcel_indices WHERE id=$1', [id]);
  return result.rows[0];
};

const findByParcelId = async (parcelId) => {
  const result = await pool.query('SELECT * FROM parcel_indices WHERE parcel_id=$1 ORDER BY date DESC', [parcelId]);
  return result.rows;
};

const findByParcelIdAndDate = async (parcelId, date) => {
  const result = await pool.query('SELECT * FROM parcel_indices WHERE parcel_id=$1 AND date=$2', [parcelId, date]);
  return result.rows[0];
};

const create = async (measurement) => {
  const {parcel_id, date, ndvi, ndmi, ndwi, soc, nitrogen, phosphorus, potassium, ph} = measurement;
  await pool.query(
    'INSERT INTO parcel_indices (parcel_id, date, ndvi, ndmi, ndwi, soc, nitrogen, phosphorus, potassium, ph) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    [parcel_id, date, ndvi, ndmi, ndwi, soc, nitrogen, phosphorus, potassium, ph]
  );
};

const update = async (id, measurement) => {
  const {date, ndvi, ndmi, ndwi, soc, nitrogen, phosphorus, potassium, ph} = measurement;
  await pool.query(
    'UPDATE parcel_indices SET date=$1, ndvi=$2, ndmi=$3, ndwi=$4, soc=$5, nitrogen=$6, phosphorus=$7, potassium=$8, ph=$9 WHERE id=$10',
    [date, ndvi, ndmi, ndwi, soc, nitrogen, phosphorus, potassium, ph, id]
  );
};

const deleteById = async (id) => {
  await pool.query('DELETE FROM parcel_indices WHERE id=$1', [id]);
};

const deleteByParcelId = async (parcelId) => {
  await pool.query('DELETE FROM parcel_indices WHERE parcel_id=$1', [parcelId]);
};

module.exports = {
  findAll,
  findById,
  findByParcelId,
  findByParcelIdAndDate,
  create,
  update,
  deleteById,
  deleteByParcelId
};