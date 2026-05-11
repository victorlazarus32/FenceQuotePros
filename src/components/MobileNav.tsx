"use client";

// Mobile-only hamburger menu. The desktop nav (in layout.tsx) uses an
// inline list; on phones that wraps or overflows, so we render a single
// hamburger button that toggles a full-width dropdown. State is local
// (open / closed) — no global store needed.
//
// The nav labels are passed in from the server layout so EN/ES copy
// stays in sync with the desktop nav without duplicating the dictionary.

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { logout } from "@/app/login/actions";

type NavLabels = {
  dashboard: string;
  estimates: string;
  schedule: string;
  invoices: string;
  clients: string;
  profile: string;
  signOut: string;
  platform: string;
  pricing: string;
  signIn: string;
  bookDemo: string;
  openMenu?: string;
  closeMenu?: string;
};

export function MobileNav({
  loggedIn,
  labels,
}: {
  loggedIn: boolean;
  labels: NavLabels;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          open
            ? labels.closeMenu ?? "Close menu"
            : labels.openMenu ?? "Open menu"
        }
        aria-expanded={open}
        className="inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-slate-100 text-ink"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[64px] sm:top-[80px] z-40 bg-white border-y border-line shadow-lg">
          <ul className="px-4 py-3 space-y-1 text-base font-medium text-ink">
            {loggedIn ? (
              <>
                <MobileItem href="/" label={labels.dashboard} onNavigate={close} />
                <MobileItem href="/estimates" label={labels.estimates} onNavigate={close} />
                <MobileItem href="/scheduling" label={labels.schedule} onNavigate={close} />
                <MobileItem href="/invoices" label={labels.invoices} onNavigate={close} />
                <MobileItem href="/clients" label={labels.clients} onNavigate={close} />
                <MobileItem href="/profile" label={labels.profile} onNavigate={close} />
                <li className="pt-2 mt-2 border-t border-line">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-3 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      {labels.signOut}
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <MobileItem href="/landing#platform" label={labels.platform} onNavigate={close} />
                <MobileItem
                  href="/landing#pricing"
                  label={labels.pricing}
                  onNavigate={close}
                />
                <MobileItem href="/login" label={labels.signIn} onNavigate={close} />
                <li className="pt-2 mt-2 border-t border-line">
                  <Link
                    href="/book-demo"
                    onClick={close}
                    className="block w-full text-center px-4 py-3 rounded-md bg-brand text-white font-bold uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {labels.bookDemo}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileItem({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="block px-3 py-3 rounded-md hover:bg-slate-100"
      >
        {label}
      </Link>
    </li>
  );
}
