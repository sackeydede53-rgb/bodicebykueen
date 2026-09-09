import Link from "next/link";
import { resetAdminPasswordWithRecovery } from "./actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  "error=missing": "Fill in every field.",
  "error=recovery": "Recovery key or login email is incorrect.",
  "error=short": "New password must be at least 8 characters.",
  "error=match": "New password and confirmation do not match.",
  "error=notconfigured":
    "Password reset is not configured. Set ADMIN_RESET_SECRET (or AUTH_SECRET) in Vercel.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotAdminPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const key = params.error ? `error=${params.error}` : "";
  const message = key ? messages[key] : null;

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-6">
      <form
        action={resetAdminPasswordWithRecovery}
        className="w-full max-w-md border border-[#d0d0d0] bg-white p-8 shadow-sm"
      >
        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#6f6f6f]">
          Bodice by Kueen
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Reset password
        </h1>
        <p className="mt-3 text-sm text-[#6f6f6f]">
          Enter your admin login email, a new password, and your recovery key
          from Vercel (<code className="text-xs">ADMIN_RESET_SECRET</code> or{" "}
          <code className="text-xs">AUTH_SECRET</code>).
        </p>

        {message && (
          <p className="mt-4 border border-[#c46b6b]/40 bg-[#c46b6b]/10 px-4 py-3 text-sm text-danger">
            {message}
          </p>
        )}

        <div className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Login email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label" htmlFor="recoveryKey">
              Recovery key
            </label>
            <input
              id="recoveryKey"
              name="recoveryKey"
              type="password"
              required
              className="input"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="input"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="input"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="admin-btn w-full">
            Reset password
          </button>
          <Link
            href="/admin/login"
            className="block text-center text-[0.65rem] uppercase tracking-[0.16em] text-[#6f6f6f] underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
