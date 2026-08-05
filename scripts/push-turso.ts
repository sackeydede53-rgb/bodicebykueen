/**
 * Apply the latest Prisma migration SQL to a remote Turso database.
 * Requires TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in the environment.
 */
import "dotenv/config";
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

function splitStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((chunk) =>
      chunk
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((statement) => statement.length > 0);
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is required. Create a DB at https://turso.tech and add it to .env",
    );
  }

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const folders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  if (folders.length === 0) {
    throw new Error("No migrations found under prisma/migrations");
  }

  const client = createClient({ url, authToken });

  for (const folder of folders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;
    const sql = fs.readFileSync(sqlPath, "utf8");
    const statements = splitStatements(sql);
    console.log(`Applying ${folder} (${statements.length} statements)...`);

    for (const statement of statements) {
      await client.execute(statement);
    }
    console.log(`  done: ${folder}`);
  }

  console.log("Turso schema is up to date.");
  console.log("Next: npm run db:seed (with TURSO_* set in .env)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
