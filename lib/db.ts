// lib/db.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Selenalamejor1',
  database: 'medtime'
});

export default pool;
