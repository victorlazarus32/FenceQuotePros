import Database from "better-sqlite3";
import path from "node:path";

const db = new Database(path.resolve("dev.db"));
const rows = db
  .prepare(
    `SELECT id, status, provider, errorMessage, createdAt
     FROM FenceVisualization
     ORDER BY createdAt DESC LIMIT 5`,
  )
  .all();
console.log(JSON.stringify(rows, null, 2));
