import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!url || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required");
  }

  const client = createClient({ url, authToken });
  const statements = [
    `ALTER TABLE "Product" ADD COLUMN "costPrice" REAL NOT NULL DEFAULT 0`,
    `ALTER TABLE "OrderItem" ADD COLUMN "unitCost" REAL NOT NULL DEFAULT 0`,
    `CREATE TABLE IF NOT EXISTS "InventoryExpense" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "amount" REAL NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'OTHER',
      "note" TEXT,
      "spentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
  ];

  for (const statement of statements) {
    try {
      await client.execute(statement);
      console.log("OK:", statement.slice(0, 72).replace(/\s+/g, " "));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("SKIP:", message.slice(0, 160));
    }
  }

  console.log("Inventory schema applied on Turso.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
