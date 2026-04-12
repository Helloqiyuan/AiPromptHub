const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const env = require('../src/config/env');

async function run() {
  const connection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    multipleStatements: true,
  });

  try {
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.resolve(__dirname, '../database/seed.sql'), 'utf8');

    await connection.query(schemaSql);
    await connection.query(seedSql);

    console.log('Database initialized successfully.');
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
