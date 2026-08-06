"use client";

import { FormEvent, useState, Suspense } from "react";
import { SessionProvider, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <div className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              defaultValue="admin@bodicebykueen.com"
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
