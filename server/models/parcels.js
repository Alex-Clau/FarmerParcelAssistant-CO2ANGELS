const pool = require('../src/config/database');

const findAll = async () => {
  const result = await pool.query('SELECT * FROM parcels ORDER BY id');
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query('SELECT * FROM parcels WHERE id=$1', [id]);
  return result.rows[0];
};

const findByFarmerId = async (farmerId) => {
  const result = await pool.query('SELECT * FROM parcels WHERE farmer_id=$1', [farmerId]);
  return result.rows;
};

const create = async (parcel) => {
  const {id, farmer_id, name, area_ha, crop} = parcel;
  await pool.query(
    'INSERT INTO parcels (id, farmer_id, name, area_ha, crop) VALUES ($1, $2, $3, $4, $5)',
    [id, farmer_id, name, area_ha, crop]
  );
};

const update = async (id, parcel) => {
  const {farmer_id, name, area_ha, crop} = parcel;
  await pool.query(
    'UPDATE parcels SET farmer_id=$1, name=$2, area_ha=$3, crop=$4 WHERE id=$5',
    [farmer_id, name, area_ha, crop, id]
  );
};

const deleteById = async (id) => {
  await pool.query('DELETE FROM parcels WHERE id=$1', [id]);
};

module.exports = {
  findAll,
  findById,
  findByFarmerId,
  create,
  update,
  deleteById
};