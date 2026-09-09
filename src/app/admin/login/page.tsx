"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { SessionProvider, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const updated = searchParams.get("updated");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(searchParams.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border border-[#d0d0d0] bg-white p-8 shadow-sm"
      >
        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#6f6f6f]">
          Bodice by Kueen
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Admin login
        </h1>
        {(updated === "email" ||
          updated === "profile" ||
          updated === "password") && (
          <p className="mt-4 text-sm text-success">
            {updated === "email"
              ? "Login email updated. Sign in with your new email."
              : updated === "password"
                ? "Password reset. Sign in with your new password."
                : "Profile updated. Sign in again to continue."}
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
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="admin-btn w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <Link
            href="/admin/forgot-password"
            className="block text-center text-[0.65rem] uppercase tracking-[0.16em] text-[#6f6f6f] underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <SessionProvider>
      <Suspense fallback={<div className="admin-shell min-h-screen" />}>
        <LoginForm />
      </Suspense>
    </SessionProvider>
  );
}
