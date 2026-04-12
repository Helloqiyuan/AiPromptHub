/**
 * 依次执行 database/tables.sql、database/data.sql（最终表结构 + 最终种子数据）。
 * 用法：npm run db:init
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const env = require("../src/config/env");

const databaseDir = path.resolve(__dirname, "../database");

async function run() {
  const connection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    multipleStatements: true,
  });

  try {
    const tablesSql = fs.readFileSync(
      path.join(databaseDir, "tables.sql"),
      "utf8",
    );
    const dataSql = fs.readFileSync(path.join(databaseDir, "data.sql"), "utf8");

    await connection.query(tablesSql);
    await connection.query(dataSql);

    console.log("[db:init] 已执行 tables.sql + data.sql。");
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  console.error("[db:init] 失败:", err);
  process.exit(1);
});
