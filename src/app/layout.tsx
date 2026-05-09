import type { Metadata } from "next";
import { Saira_Condensed, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { isLoggedIn } from "@/lib/session";
import { logout } from "./login/actions";

const display = Saira_Condensed({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-saira",
});

const ui = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

const script = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Fence Quote Pros — Estimates & invoices for fence contractors",
  description:
    "Build estimates and invoices fast. Linear-foot pricing, post and gate calculator, payments — designed for fence contractors.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await isLoggedIn();
  return (
    <html
      lang="en"
      className={`${display.variable} ${ui.variable} ${mono.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink" suppressHydrationWarning>
        <header className="no-print bg-white border-b border-line">
          <nav className="max-w-6xl mx-auto px-4 h-32 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center group shrink-0"
              aria-label="Fence Quote Pros home"
            >
              <Image
                src="/logo.png"
                alt="Fence Quote Pros"
                width={112}
                height={112}
                priority
                className="rounded-md"
              />
            </Link>
            <div className="flex gap-1 text-sm font-medium text-slate-600 grow justify-end items-center">
              {loggedIn && (
                <>
                  <NavLink href="/">Dashboard</NavLink>
                  <NavLink href="/estimates">Estimates</NavLink>
                  <NavLink href="/invoices">Invoices</NavLink>
                  <NavLink href="/clients">Clients</NavLink>
                  <NavLink href="/profile">Profile</NavLink>
                  <form action={logout} className="ml-2">
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-md text-sm hover:bg-slate-100 hover:text-ink transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              )}
              {!loggedIn && (
                <>
                  <NavLink href="/landing">Pricing</NavLink>
                  <NavLink href="/login">Sign in</NavLink>
                  <Link
                    href="/signup"
                    className="ml-2 inline-flex items-center px-4 py-2 rounded-md bg-brand text-white text-sm font-bold uppercase tracking-wide hover:bg-ink transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md hover:bg-slate-100 hover:text-ink transition-colors"
    >
      {children}
    </Link>
  );
}
