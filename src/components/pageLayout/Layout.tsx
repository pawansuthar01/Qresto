"use client";

import { Header } from "./heder";
import { Footer } from "./footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 md:px-6 py-6">{children}</main>
      <Footer />
    </div>
  );
}
