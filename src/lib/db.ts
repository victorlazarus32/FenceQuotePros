import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Single shared Prisma client. The {globalForPrisma} pattern keeps a
// single instance alive across hot-reload boundaries in dev so we don't
// open a new connection pool on every code change.
//
// Connects to Postgres via DATABASE_URL (Supabase in production; a local
// or pooled connection string in development).

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Recycle idle sockets BEFORE the server side (pgbouncer on Supabase,
  // `prisma dev` locally) kills them — stale pooled connections surface as
  // P1017 "Server has closed the connection" 500s on random page loads.
  idleTimeoutMillis: 15_000,
  keepAlive: true,
  // Cap concurrent connections. Pages that fan out queries via Promise.all
  // (dashboard) otherwise burst-open sockets, which local `prisma dev` (and
  // pgbouncer under pressure) answers by closing connections → P1017.
  // pg queues excess queries; a small pool serializes bursts harmlessly.
  max: Number(process.env.DB_POOL_MAX ?? 4),
});

export const db: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
