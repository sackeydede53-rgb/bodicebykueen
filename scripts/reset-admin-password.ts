/**
 * Emergency admin password reset (Turso or local DB).
 *
 * Usage:
 *   npx tsx scripts/reset-admin-password.ts
 *   npx tsx scripts/reset-admin-password.ts --password=YourNewPassword
 *   npx tsx scripts/reset-admin-password.ts --email=you@email.com --password=YourNewPassword
 *
 * Defaults to ADMIN_EMAIL + ADMIN_PASSWORD from .env when flags are omitted.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { getLibSqlConfig } from "../src/lib/libsql";

function argValue(flag: string) {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`));
  return hit ? hit.slice(flag.length + 1) : undefined;
}

async function main() {
  const emailArg = argValue("--email");
  const passwordArg = argValue("--password");
  const email = (emailArg || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = (passwordArg || process.env.ADMIN_PASSWORD || "").trim();

  if (!password || password.length < 8) {
    throw new Error(
      "Password must be at least 8 characters. Pass --password=... or set ADMIN_PASSWORD in .env",
    );
  }

  const adapter = new PrismaLibSql(getLibSqlConfig());
  const prisma = new PrismaClient({ adapter });

  try {
    const admins = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    if (admins.length === 0) {
      const hash = await bcrypt.hash(password, 12);
      const created = await prisma.adminUser.create({
        data: {
          email: email || "admin@bodicebykueen.com",
          passwordHash: hash,
          name: process.env.ADMIN_NAME || "Bodice Admin",
        },
      });
      console.log(`Created admin ${created.email}`);
      return;
    }

    console.log("Admin accounts found:");
    for (const a of admins) console.log(`  - ${a.email}`);

    const target =
      (email ? admins.find((a) => a.email.toLowerCase() === email) : null) ??
      (admins.length === 1 ? admins[0] : null);

    if (!target) {
      throw new Error(
        email
          ? `No admin with email ${email}. Use one of the emails listed above.`
          : "Multiple admins exist. Pass --email=... explicitly.",
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.update({
      where: { id: target.id },
      data: { passwordHash },
    });

    console.log(`Password reset for ${target.email}`);
    console.log("Sign in at /admin/login, then change it under Account.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
