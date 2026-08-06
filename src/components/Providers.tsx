"use client";

import { CartProvider } from "@/lib/cart";
import { ThemeProvider } from "@/lib/theme";

/** Storefront providers only — auth SessionProvider lives on admin login. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
