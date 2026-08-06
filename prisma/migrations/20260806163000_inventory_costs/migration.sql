-- Inventory cost tracking + expense log
ALTER TABLE "Product" ADD COLUMN "costPrice" REAL NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN "unitCost" REAL NOT NULL DEFAULT 0;

CREATE TABLE "InventoryExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "note" TEXT,
    "spentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
