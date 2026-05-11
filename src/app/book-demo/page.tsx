import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Mail, Phone } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { getLangFromCookies } from "@/lib/landing/lang";
import { AUTH_COPY } from "@/lib/i18n/auth";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies();
  return { title: AUTH_COPY[lang].bookDemo.title };
}

export default async function BookDemoPage() {
  const lang = await getLangFromCookies();
  const c = AUTH_COPY[lang].bookDemo;
  const mailtoHref = `mailto:victor@permitsolutions.us?subject=${encodeURIComponent(
    c.emailSubject,
  )}&body=${encodeURIComponent(c.emailBody)}`;

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-paper flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <LangToggle current={lang} returnTo="/book-demo" tone="dark" />
      </div>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl border-2 border-line shadow-[6px_6px_0_var(--brand)] p-8 sm:p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs uppercase tracking-wider font-bold mb-6">
            <Calendar className="w-3.5 h-3.5" />
            {c.tag}
          </div>

          <h1
            className="text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1,
              letterSpacing: "0.005em",
            }}
          >
            {c.heading}
          </h1>

          <p className="text-base text-slate-700 mt-4 leading-relaxed">
            {c.lead}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={mailtoHref}
              className="rounded-xl border-2 border-line bg-paper p-5 hover:border-brand transition-colors group"
            >
              <Mail className="w-6 h-6 text-brand mb-3" />
              <div
                className="text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  fontSize: "var(--text-md)",
                  letterSpacing: "0.005em",
                }}
              >
                {c.emailCardTitle}
              </div>
              <div className="text-sm text-slate-600 mt-1 break-all">
                victor@permitsolutions.us
              </div>
              <div className="text-xs text-brand font-bold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {c.emailCta}
                <ArrowRight className="w-3 h-3" />
              </div>
            </a>

            <a
              href="tel:+13055550100"
              className="rounded-xl border-2 border-line bg-paper p-5 hover:border-brand transition-colors group"
            >
              <Phone className="w-6 h-6 text-brand mb-3" />
              <div
                className="text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  fontSize: "var(--text-md)",
                  letterSpacing: "0.005em",
                }}
              >
                {c.callCardTitle}
              </div>
              <div className="text-sm text-slate-600 mt-1">305-555-0100</div>
              <div className="text-xs text-brand font-bold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {c.callCta}
                <ArrowRight className="w-3 h-3" />
              </div>
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-line text-sm text-slate-600">
            {c.tryItPrefix}{" "}
            <Link
              href="/signup"
              className="font-bold text-brand hover:text-ink"
            >
              {c.trialCta}
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-6">
          {c.builtIn}
        </div>
      </div>
    </div>
  );
}
