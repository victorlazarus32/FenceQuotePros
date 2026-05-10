import type { Metadata, Viewport } from "next";
import { Saira_Condensed, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { isLoggedIn } from "@/lib/session";
import { logout } from "./login/actions";
import { MobileNav } from "@/components/MobileNav";

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

// Mobile viewport setup. width=device-width + initialScale=1 keeps the
// page from pinch-zooming on phones; themeColor matches our brand
// background so iOS Safari's status bar / Android chrome blend in.
// userScalable=true (default) is preserved so users can still pinch
// zoom for accessibility.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbfaf6",
  viewportFit: "cover",
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
          <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center group shrink-0"
              aria-label="Fence Quote Pros home"
            >
              {/* Wide horizontal logo. The 3:2 source has gradient
                  atmosphere baked in, so we width-constrain (not
                  height-constrain) and let the nav grow vertically to
                  match. Mobile / tablet / desktop sizes tuned so the
                  mark dominates the left side without crowding nav. */}
              <Image
                src="/logo-v2.png"
                alt="Fence Quote Pros"
                width={1536}
                height={1024}
                priority
                className="w-[220px] sm:w-[300px] lg:w-[380px] h-auto"
              />
            </Link>
            <MobileNav loggedIn={loggedIn} />
            <div className="hidden md:flex gap-1 text-sm font-medium text-slate-600 grow justify-end items-center">
              {loggedIn && (
                <>
                  <NavLink href="/">Dashboard</NavLink>
                  <NavLink href="/estimates">Estimates</NavLink>
                  <NavLink href="/scheduling">Schedule</NavLink>
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
                  <NavLink href="/landing#platform">Platform</NavLink>
                  <NavLink href="/landing#pricing">Pricing</NavLink>
                  <NavLink href="/login">Sign in</NavLink>
                  <Link
                    href="/book-demo"
                    className="ml-2 inline-flex items-center px-4 py-2 rounded-md bg-brand text-white text-sm font-bold uppercase tracking-wide hover:bg-ink transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Book a demo
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
