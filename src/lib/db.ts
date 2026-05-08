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
});

export const db: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
