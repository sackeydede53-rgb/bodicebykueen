import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell min-h-screen">
      {/* Fixed sidebar — stays put while the main pane scrolls */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col overflow-y-auto bg-ink text-ivory md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(215,177,183,0.45), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(234,197,204,0.3), transparent 45%)",
          }}
        />
        <div className="relative flex min-h-full flex-col px-6 py-8">
          <Link href="/" className="group">
            <div className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em]">
              Bodice
            </div>
            <div className="mt-1 text-[0.62rem] uppercase tracking-[0.32em] text-champagne">
              by Kueen
            </div>
          </Link>
          <p className="mt-6 text-[0.62rem] uppercase tracking-[0.28em] text-ivory/40">
            Atelier console
          </p>

          <AdminNav />

          <div className="mt-auto border-t border-white/10 pt-6">
            <p className="truncate text-sm text-ivory/80">
              {session.user.name || "Admin"}
            </p>
            <p className="mt-1 truncate text-xs text-ivory/40">
              {session.user.email}
            </p>
            <Link
              href="/admin/account"
              className="mt-4 block text-[0.65rem] uppercase tracking-[0.2em] text-champagne/70 transition hover:text-champagne"
            >
              Account settings
            </Link>
            <form
              className="mt-3"
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="text-[0.65rem] uppercase tracking-[0.2em] text-champagne/70 transition hover:text-champagne"
              >
                Sign out
              </button>
            </form>
            <Link
              href="/"
              className="mt-4 block text-[0.65rem] uppercase tracking-[0.2em] text-ivory/35 transition hover:text-ivory/70"
            >
              View storefront →
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-h-screen md:pl-[260px]">
        <div className="mx-auto max-w-[1140px] px-4 py-6 md:px-10 md:py-10">
          <div className="mb-6 md:hidden">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <div className="font-[family-name:var(--font-display)] text-2xl tracking-[0.06em]">
                  Bodice
                </div>
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-[#6f6f6f]">
                  Admin
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/admin/login" });
                }}
              >
                <button
                  type="submit"
                  className="text-[0.65rem] uppercase tracking-[0.16em] text-[#6f6f6f]"
                >
                  Sign out
                </button>
              </form>
            </div>
            <AdminNav mobile />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
