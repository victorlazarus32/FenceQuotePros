import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/session";
import { SignupForm } from "./SignupForm";
import LangToggle from "@/components/LangToggle";
import { getLangFromCookies } from "@/lib/landing/lang";
import { AUTH_COPY } from "@/lib/i18n/auth";
import { NAV_COPY } from "@/lib/i18n/nav";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies();
  return { title: AUTH_COPY[lang].signup.title };
}

export default async function SignupPage() {
  if (await isLoggedIn()) redirect("/");
  const lang = await getLangFromCookies();
  const c = AUTH_COPY[lang].signup;
  const n = NAV_COPY[lang];
  // Private-beta gate — mirrors the server-action guard in login/actions.ts
  // (the action is the enforcement; this just shows a friendly wall).
  const signupsOpen = process.env.SIGNUPS_OPEN === "1";

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-ink text-paper flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <LangToggle current={lang} returnTo="/signup" tone="light" />
      </div>
      <div className="w-full max-w-md">
        <Link
          href="/landing"
          className="flex items-center gap-2 mb-10 justify-center"
          aria-label={n.homeAriaLabel}
        >
          <Image
            src="/logo-v2.png"
            alt=""
            width={48}
            height={48}
            className="rounded-md bg-white p-1"
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              textTransform: "uppercase",
              fontSize: "var(--text-xl)",
              letterSpacing: "0.005em",
            }}
          >
            Fence <span className="text-brand">Quote</span> Pros
          </span>
        </Link>

        <div className="bg-paper text-ink rounded-lg p-8 shadow-[6px_6px_0_var(--brand)] border-2 border-paper">
          <h1
            className="mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              textTransform: "uppercase",
              fontSize: "var(--text-2xl)",
              letterSpacing: "0.005em",
            }}
          >
            {signupsOpen
              ? c.heading
              : lang === "es"
                ? "Beta privada"
                : "Private beta"}
          </h1>
          {signupsOpen ? (
            <>
              <p className="text-sm text-slate-600 mb-6">{c.lead}</p>
              <SignupForm
                labels={{
                  nameLabel: c.nameLabel,
                  companyLabel: c.companyLabel,
                  emailLabel: c.emailLabel,
                  passwordLabel: c.passwordLabel,
                  submit: c.submit,
                  submitPending: c.submitPending,
                }}
              />
            </>
          ) : (
            <p className="text-sm text-slate-600 mb-6">
              {lang === "es"
                ? "Fence Quote Pros está en beta privada — los registros están cerrados por ahora. ¿Ya tienes cuenta? Inicia sesión abajo."
                : "Fence Quote Pros is in private beta — signups are closed for now. Already have an account? Sign in below."}
            </p>
          )}

          <div className="mt-5 text-xs text-slate-500 text-center">
            {c.haveAccountPrefix}{" "}
            <Link href="/login" className="text-brand font-semibold">
              {c.loginCta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
