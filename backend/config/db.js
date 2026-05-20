const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, //sicheres
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,  // ← NEU: Gib Datum als String zurück, nicht als Date-Objekt
  timezone: 'Z'       // ← NEU: UTC als Timezone (verhindert Konvertierung)

});

const promisePool = pool.promise();

// Verbindungstest
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB-Verbindung fehlgeschlagen:', err.message);
  } else {
    console.log('✅ DB-Verbindung erfolgreich');
    connection.release();
  }
});

module.exports = promisePool;