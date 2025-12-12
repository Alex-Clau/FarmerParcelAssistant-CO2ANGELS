const pool = require('./config/database')

async function main() {
  const client = await pool.connect();

  try {
    //const response = await client.query('SELECT * FROM subscriber');
    //const {rows} = response;
    //console.log(rows);
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
}

main()
  .then(() => console.log('Connected to Postgres!'))
  .catch(err => console.error('Error connecting to Postgres!', err));