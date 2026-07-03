import type { Metadata, Viewport } from "next";
import { Saira_Condensed, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { isLoggedIn } from "@/lib/session";
import { logout } from "./login/actions";
import { MobileNav } from "@/components/MobileNav";
import LangToggle from "@/components/LangToggle";
import { getLangFromCookies } from "@/lib/landing/lang";
import { NAV_COPY } from "@/lib/i18n/nav";

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
  const lang = await getLangFromCookies();
  const n = NAV_COPY[lang];
  return (
    <html
      lang={lang}
      className={`${display.variable} ${ui.variable} ${mono.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink" suppressHydrationWarning>
        <header className="no-print bg-white border-b border-line">
          <nav className="max-w-6xl mx-auto px-4 h-16 sm:h-20 lg:h-24 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center group shrink-0"
              aria-label={n.homeAriaLabel}
            >
              {/* The source PNG (1536×1024, 3:2) has gradient atmosphere
                  + glow padding baked in — only the middle ~30% is the
                  actual mark + wordmark. We render the image larger than
                  the visible window and crop to the middle band so the
                  visible logo dominates while the nav stays short. */}
              <div className="relative h-16 sm:h-20 lg:h-24 w-[300px] sm:w-[420px] lg:w-[540px] overflow-hidden flex items-center">
                <Image
                  src="/logo-v2.png"
                  alt="Fence Quote Pros"
                  width={1536}
                  height={1024}
                  priority
                  className="w-full h-auto"
                />
              </div>
            </Link>
            <MobileNav loggedIn={loggedIn} labels={n} />
            <div className="hidden md:flex gap-1 text-sm font-medium text-slate-600 grow justify-end items-center">
              {loggedIn && (
                <>
                  <NavLink href="/">{n.dashboard}</NavLink>
                  <NavLink href="/estimates">{n.estimates}</NavLink>
                  <NavLink href="/jobs">{n.jobs}</NavLink>
                  <NavLink href="/scheduling">{n.schedule}</NavLink>
                  <NavLink href="/invoices">{n.invoices}</NavLink>
                  <NavLink href="/reports">{n.reports}</NavLink>
                  <NavLink href="/clients">{n.clients}</NavLink>
                  <NavLink href="/profile">{n.profile}</NavLink>
                  <form action={logout} className="ml-2">
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-md text-sm hover:bg-slate-100 hover:text-ink transition-colors"
                    >
                      {n.signOut}
                    </button>
                  </form>
                </>
              )}
              {!loggedIn && (
                <>
                  <NavLink href="/landing#platform">{n.platform}</NavLink>
                  <NavLink href="/landing#pricing">{n.pricing}</NavLink>
                  <NavLink href="/login">{n.signIn}</NavLink>
                  <Link
                    href="/book-demo"
                    className="ml-2 inline-flex items-center px-4 py-2 rounded-md bg-brand text-white text-sm font-bold uppercase tracking-wide hover:bg-ink transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {n.bookDemo}
                  </Link>
                </>
              )}
              {/* Language toggle — always visible so users can switch
                  language from any page. Persists via fqp-lang cookie. */}
              <span className="ml-3 pl-3 border-l border-line">
                <LangToggle current={lang} tone="dark" returnTo="/" />
              </span>
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
