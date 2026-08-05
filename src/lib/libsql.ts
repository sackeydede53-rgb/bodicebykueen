import path from "path";
import type { Config } from "@libsql/client";

/**
 * Resolve libSQL config for local SQLite (file:) or Turso (libsql:// / https://).
 * On Vercel, set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 */
export function getLibSqlConfig(): Config {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  if (tursoUrl) {
    return {
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    };
  }

  let url = process.env.DATABASE_URL?.trim() || "file:./dev.db";

  if (url.startsWith("file:")) {
    const rawPath = url.slice("file:".length);
    if (rawPath !== ":memory:") {
      const normalized = rawPath.replace(/^\.\//, "");
      const absolute =
        path.isAbsolute(normalized) || /^[A-Za-z]:/.test(normalized)
          ? normalized
          : path.join(/*turbopackIgnore: true*/ process.cwd(), normalized);
      // libSQL expects a file URL; Windows needs three slashes + forward slashes
      url =
        process.platform === "win32"
          ? `file:///${absolute.replace(/\\/g, "/")}`
          : `file://${absolute}`;
    }
  }

  return { url };
}
