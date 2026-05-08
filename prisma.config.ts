// Prisma 7 reads connection URLs from this config file (not from the
// schema). The schema only declares the provider; URL + directUrl come
// from environment variables resolved here.
//
// DATABASE_URL  → pooled connection (port 6543) used at runtime
// DIRECT_URL    → direct connection (port 5432) used by `prisma migrate`
//                 and tools that hold a long-lived connection
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Migrate / introspect read this URL. In production, this should point
  // at the *direct* Supabase connection (port 5432) so prisma migrate
  // doesn't fight pgbouncer's prepared-statement caching. The runtime
  // PrismaClient (lib/db.ts) reads DATABASE_URL via the pg adapter.
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
