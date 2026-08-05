import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDbPath() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const dbPath = url.replace(/^file:/, "");
  if (dbPath === ":memory:") return dbPath;
  if (path.isAbsolute(dbPath) || /^[A-Za-z]:/.test(dbPath)) return dbPath;
  return path.join(/*turbopackIgnore: true*/ process.cwd(), dbPath.replace(/^\.\//, ""));
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveDbPath() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
