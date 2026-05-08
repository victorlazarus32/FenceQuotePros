import Database from "better-sqlite3";
const db = new Database("./dev.db", { readonly: true });
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
  .all();
console.log("Tables:", tables.map((t) => t.name).join(", "));
for (const tbl of ["User", "Client", "Estimate", "Invoice", "LineItem", "FenceJob", "Payment"]) {
  try {
    const c = db.prepare(`SELECT COUNT(*) as c FROM "${tbl}"`).get();
    console.log(`${tbl}: ${c.c}`);
  } catch (e) {
    console.log(`${tbl}: N/A (${e.message})`);
  }
}
