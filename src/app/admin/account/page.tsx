import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateAdminPassword, updateAdminProfile } from "./actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  "ok=profile": "Display name and login email updated.",
  "ok=password": "Password updated successfully.",
  "error=missing": "Please fill in all required fields.",
  "error=password": "Current password is incorrect.",
  "error=email": "Enter a valid login email.",
  "error=taken": "That login email is already in use.",
  "error=short": "New password must be at least 8 characters.",
  "error=match": "New password and confirmation do not match.",
};

type Props = {
  searchParams: Promise<{ ok?: string; error?: string }>;
};

export default async function AdminAccountPage({ searchParams }: Props) {
  const session = await requireAdmin();
  const params = await searchParams;
  const user = await prisma.adminUser.findUnique({
    where: { id: session.user!.id! },
  });

  if (!user) {
    return <p className="text-sm text-danger">Admin account not found.</p>;
  }

  const key = params.ok
    ? `ok=${params.ok}`
    : params.error
      ? `error=${params.error}`
      : "";
  const message = key ? messages[key] : null;
  const isError = Boolean(params.error);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Account
      </h1>
      <p className="mt-2 text-sm text-[#6f6f6f]">
        Change your display name, login email (username), and password.
      </p>

      {message && (
        <p
          className={`mt-6 border px-4 py-3 text-sm ${
            isError
              ? "border-[#c46b6b]/40 bg-[#c46b6b]/10 text-danger"
              : "border-[#3d5a45]/25 bg-[#3d5a45]/10 text-success"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form
          action={updateAdminProfile}
          className="admin-panel space-y-4 p-6"
        >
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              Profile
            </h2>
            <p className="mt-1 text-xs text-[#6f6f6f]">
              Login email is what you use to sign in.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="name">
              Display name
            </label>
            <input
              id="name"
              name="name"
              required
              className="input"
              defaultValue={user.name ?? ""}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Login email (username)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              defaultValue={user.email}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="label" htmlFor="profileCurrentPassword">
              Current password
            </label>
            <input
              id="profileCurrentPassword"
              name="currentPassword"
              type="password"
              required
              className="input"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-btn">
            Save profile
          </button>
        </form>

        <form
          action={updateAdminPassword}
          className="admin-panel space-y-4 p-6"
        >
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              Password
            </h2>
            <p className="mt-1 text-xs text-[#6f6f6f]">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="passwordCurrent">
              Current password
            </label>
            <input
              id="passwordCurrent"
              name="currentPassword"
              type="password"
              required
              className="input"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="label" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
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

          <button type="submit" className="admin-btn">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
