import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Hammer,
  MapPin,
  Ruler,
} from "lucide-react";
import AnimatedFenceMark from "@/components/AnimatedFenceMark";
import AnimatedScheduleMockup from "@/components/AnimatedScheduleMockup";
import BeforeAfterVisual from "@/components/BeforeAfterVisual";
import BrandWordmark from "@/components/BrandWordmark";
import FenceBlueprintPlan from "@/components/FenceBlueprintPlan";
import PermitAutofillSpot from "@/components/PermitAutofillSpot";
import {
  GateSwingMark,
  SitePlanCorner,
} from "@/components/FenceBlueprintMark";
import LangToggle from "@/components/LangToggle";
import { COPY } from "@/lib/landing/copy";
import { resolveLang, type Lang } from "@/lib/landing/lang";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const lang = await resolveLang(sp.lang);
  const c = COPY[lang];
  return {
    title: c.metaTitle,
    description: c.metaDescription,
  };
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const sp = await searchParams;
  const lang = await resolveLang(sp.lang);
  const c = COPY[lang];
  return (
    <div className="-mx-4 -my-8 bg-paper">
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative bg-ink text-paper border-b border-paper/10 overflow-hidden">
        {/* Architectural anchor in the upper-left so the dark column
            doesn't read as empty space behind the headline. Pinned to
            the section corner, low-opacity, decorative only. */}
        <SitePlanCorner
          className="absolute top-6 left-6 w-14 h-14 text-brand/40 pointer-events-none hidden sm:block"
        />

        {/* EN / ES language toggle — upper right. Persists via the
            fqp-lang cookie so the choice carries across the rest of
            the site. */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <LangToggle current={lang} returnTo="/landing" tone="light" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <div>
            {/* Geographic / vintage stamp — quiet gravitas above the
                primary BlueprintTag. Matches the footer 'Built in Miami'
                framing without repeating the brand name. */}
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/45 mb-3">
              <span className="w-1.5 h-1.5 bg-brand rounded-full" />
              {c.hero.geoStamp}
            </div>
            <BlueprintTag>{c.hero.blueprintTag}</BlueprintTag>
            <h1
              className="mt-5 text-paper"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(44px, 6.4vw, 92px)",
                lineHeight: 0.92,
                letterSpacing: "0.005em",
              }}
            >
              {c.hero.headline.line1}
              <br />
              <span className="text-brand">{c.hero.headline.line2}</span>
              <br />
              {c.hero.headline.line3}
            </h1>
            <p className="mt-6 max-w-xl text-lg sm:text-xl text-paper/80 leading-relaxed">
              {c.hero.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryCta href={`/book-demo?lang=${lang}`}>
                {c.hero.primaryCta}
              </PrimaryCta>
              <SecondaryCta href={`/signup?lang=${lang}`}>
                {c.hero.secondaryCta}
              </SecondaryCta>
            </div>
            <div className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
              <span className="w-6 h-px bg-brand" />
              {c.hero.fineLine}
            </div>
          </div>

          <HeroVisual lang={lang} />
        </div>
      </section>

      {/* ─── CREDIBILITY STRIP — positioning between hero and pain points ── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-8 lg:gap-x-10">
            {c.signals.map((s) => (
              <ProofBlock key={s.title} heading={s.title} body={s.body} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2 — COMMON CHALLENGES ───────────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <BlueprintTag>{c.problem.blueprintTag}</BlueprintTag>
            <h2
              className="mt-5"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              {c.problem.headline.lead}{" "}
              <span className="text-brand">{c.problem.headline.tail}</span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-0 border border-paper/15">
            {c.problem.cards.map((card, i) => (
              <ProblemCard
                key={card.title}
                number={`0${i + 1}`}
                title={card.title}
                body={card.body}
                middle={i === 1}
                prefix={c.mockup.problemLabel}
              />
            ))}
          </div>

          <div className="mt-10 max-w-3xl space-y-2 text-base leading-relaxed">
            <p className="font-semibold">
              <BrandWordmark />
              {" "}{c.problem.bottomLead}
            </p>
            <p className="text-paper/75">{c.problem.bottomBody}</p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — VISUAL FENCE PREVIEW (FLAGSHIP) ─────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <BlueprintTag dark>{c.visualization.blueprintTag}</BlueprintTag>
            <h2
              className="mt-5 text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(32px, 5vw, 64px)",
                lineHeight: 0.95,
                letterSpacing: "0.005em",
              }}
            >
              {c.visualization.headline.lead}{" "}
              <span className="text-brand">
                {c.visualization.headline.tail}
              </span>
            </h2>
            <p className="mt-6 text-lg text-text-soft leading-relaxed max-w-xl">
              {c.visualization.body}
            </p>
            <ul className="mt-8 space-y-3 max-w-md">
              {c.visualization.bullets.map((b) => (
                <CheckRow key={b}>{b}</CheckRow>
              ))}
            </ul>
            <div className="mt-10 inline-flex items-center gap-3 border border-ink px-4 py-2 bg-white">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
                {c.visualization.outcomeLabel}
              </span>
              <span
                className="text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "var(--text-lg)",
                  textTransform: "uppercase",
                }}
              >
                {c.visualization.outcomeValue}
              </span>
            </div>
          </div>

          <div className="relative">
            <CornerTicks />
            <BeforeAfterVisual lang={lang} />
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 — SMART ESTIMATING ────────────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-12 items-start">
            <div>
              {/* Inline brand-mark lockup: animated fence icon + section
                  label on the same horizontal line. The AnimatedFenceMark
                  has its own internal 'showLabel' (active fence type), so
                  hide that and use the BlueprintTag as the section name. */}
              <div className="flex items-center gap-4 mb-6">
                <AnimatedFenceMark
                  className="text-brand/70 w-24 sm:w-28 shrink-0"
                  showLabel={false}
                />
                <BlueprintTag>{c.estimating.blueprintTag}</BlueprintTag>
              </div>
              <h2
                className="mt-5"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontSize: "clamp(30px, 4.6vw, 56px)",
                  lineHeight: 1,
                  letterSpacing: "0.005em",
                }}
              >
                {c.estimating.headline.lead}{" "}
                <span className="text-brand">{c.estimating.headline.tail}</span>
              </h2>
              <p className="mt-5 text-paper/75 text-lg leading-relaxed">
                {c.estimating.body}
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-paper/85 max-w-md">
                {c.estimating.bulletsTop.map((b) => (
                  <CheckRow key={b} dark>{b}</CheckRow>
                ))}
              </ul>
            </div>

            <FenceBlueprintPlan lang={lang} />
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 border border-paper/15">
            {c.estimating.tiles.map((label) => (
              <EstimateTile
                key={label}
                label={label}
                caption={c.mockup.moduleLabel}
              />
            ))}
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
            <ul className="space-y-3 text-paper/85">
              {c.estimating.bulletsBottom.map((b) => (
                <CheckRow key={b} dark>{b}</CheckRow>
              ))}
            </ul>
            <EstimateMockup lang={lang} />
          </div>
        </div>
      </section>

      {/* ─── SECTION 5 — PERMIT-READY WORKFLOWS ──────────────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <BlueprintTag dark>{c.permits.blueprintTag}</BlueprintTag>
            <h2
              className="mt-5 text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              {c.permits.headline.lead}{" "}
              <span className="text-brand">{c.permits.headline.tail}</span>
            </h2>
            <p className="mt-5 text-lg text-text-soft leading-relaxed">
              {c.permits.body}
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
              {c.permits.bullets.map((b) => (
                <CheckRow key={b}>{b}</CheckRow>
              ))}
            </ul>
          </div>

          <div className="mt-12 sm:mt-16">
            <div className="mb-4 flex items-center justify-between">
              <BlueprintTag dark>{c.permits.demoBadge}</BlueprintTag>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-soft">
                {c.permits.demoLabel}
              </span>
            </div>
            <PermitAutofillSpot lang={lang} />
          </div>
        </div>
      </section>

      {/* ─── SECTION 5b — PRODUCTION SCHEDULING ─────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_1.15fr] gap-14 items-center">
          <div>
            <BlueprintTag>{c.scheduling.blueprintTag}</BlueprintTag>
            <h2
              className="mt-5"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              {c.scheduling.headline.lead}{" "}
              <span className="text-brand">{c.scheduling.headline.tail}</span>
            </h2>
            <p className="mt-5 text-lg text-paper/80 leading-relaxed max-w-xl">
              {c.scheduling.body}
            </p>
            <ul className="mt-8 space-y-3 max-w-md">
              {c.scheduling.bullets.map((b) => (
                <CheckRow key={b} dark>{b}</CheckRow>
              ))}
            </ul>
          </div>

          <AnimatedScheduleMockup lang={lang} />
        </div>
      </section>

      {/* ─── SECTION 6 — WORKER'S ACCOUNTABILITY LIST ───────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-14 items-center">
          <WorkOrderMockup lang={lang} />

          <div>
            <div className="flex items-center gap-3">
              <BlueprintTag>{c.fieldOps.blueprintTag}</BlueprintTag>
              <GateSwingMark className="text-brand/70 w-7 h-7" />
            </div>
            <h2
              className="mt-5"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              {c.fieldOps.headline.lead}{" "}
              <span className="text-brand">{c.fieldOps.headline.tail}</span>
            </h2>
            <p className="mt-5 text-lg text-paper/80 leading-relaxed max-w-xl">
              {c.fieldOps.body}
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 max-w-lg">
              {c.fieldOps.bullets.map((b) => (
                <CheckRow key={b} dark>{b}</CheckRow>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7 — TRUST / AUTHENTICITY ───────────────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <BlueprintTag dark>{c.trust.blueprintTag}</BlueprintTag>
          <h2
            className="mt-6 text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "clamp(32px, 5vw, 64px)",
              lineHeight: 1,
              letterSpacing: "0.005em",
            }}
          >
            {c.trust.headline.lead}{" "}
            <span className="text-brand">{c.trust.headline.tail}</span>
          </h2>
          <p className="mt-6 text-lg text-text-soft leading-relaxed max-w-3xl mx-auto">
            {c.trust.body.intro}{" "}
            <BrandWordmark />
            {" "}{c.trust.body.outroBefore} {c.trust.body.outroAfter}
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 border border-line bg-white">
            {c.trust.credentials.map((cred) => (
              <CredentialTile key={cred} caption={c.mockup.credentialLabel}>
                {cred}
              </CredentialTile>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <BlueprintTag>{c.pricing.blueprintTag}</BlueprintTag>
            <h2
              className="mt-5"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(28px, 4.4vw, 52px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              {c.pricing.headline.lead}{" "}
              <span className="text-brand">{c.pricing.headline.tail}</span>
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:items-start">
            {c.pricing.tiers.map((tier, i) => (
              <PricingTier
                key={tier.name}
                name={tier.name}
                price={tier.price}
                tagline={tier.tagline}
                features={tier.features}
                cta={tier.cta}
                featured={i === 1}
                monthlyLabel={c.pricing.monthly}
                mostPopLabel={c.pricing.mostPop}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <BlueprintTag>{c.finalCta.blueprintTag}</BlueprintTag>
          <h2
            className="mt-6"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "clamp(36px, 5.6vw, 72px)",
              lineHeight: 0.95,
              letterSpacing: "0.005em",
            }}
          >
            {c.finalCta.headline.lead}{" "}
            <span className="text-brand">{c.finalCta.headline.tail}</span>
          </h2>
          <p className="mt-6 text-lg text-paper/80 max-w-2xl mx-auto">
            {c.finalCta.body}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <PrimaryCta href={`/book-demo?lang=${lang}`} big>
              {c.finalCta.primary}
            </PrimaryCta>
            <SecondaryCta href={`/signup?lang=${lang}`} big>
              {c.finalCta.secondary}
            </SecondaryCta>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-ink text-paper">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            {/* Logo lockup (icon + wordmark). Source PNG (1536x1024) has
                gradient atmosphere baked in around the actual mark; render
                it large and clip the middle band so the visible logo
                dominates without ballooning footer height.

                The PNG's BLACK wordmark portions disappear into the
                bg-ink footer, so we run a CSS filter that flips dark
                pixels to light while preserving colored ones:
                  invert(1)            -> black->white, orange->cyan-ish
                  hue-rotate(180deg)   -> cyan-ish back to orange, white
                                          unaffected (no saturation)
                Net result on this footer: white FENCE / orange QUOTE /
                white PROS, orange icon preserved. */}
            <div className="relative h-24 sm:h-28 w-[420px] sm:w-[480px] overflow-hidden flex items-center -ml-4 sm:-ml-6 mb-3">
              <Image
                src="/logo-v2.png"
                alt="Fence Quote Pros"
                width={1536}
                height={1024}
                className="w-full h-auto"
                style={{ filter: "invert(1) hue-rotate(180deg)" }}
              />
            </div>
          </div>
          <FooterCol
            title={c.footer.platformTitle}
            links={c.footer.platformLinks.map((label) => [
              label,
              `/landing?lang=${lang}#`,
            ])}
          />
          <FooterCol
            title={c.footer.companyTitle}
            links={[
              [c.footer.companyLinks[0], `/book-demo?lang=${lang}`],
              [c.footer.companyLinks[1], `/landing?lang=${lang}#pricing`],
              [c.footer.companyLinks[2], "mailto:victor@permitsolutions.us"],
            ]}
          />
          <FooterCol
            title={c.footer.accountTitle}
            links={[
              [c.footer.accountLinks[0], `/login?lang=${lang}`],
              [c.footer.accountLinks[1], "#"],
              [c.footer.accountLinks[2], "#"],
            ]}
          />
        </div>
        <div className="border-t border-paper/10">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs opacity-60 flex items-center gap-1.5">
            <span>© {new Date().getFullYear()}</span>
            <BrandWordmark />
            <span>. {c.footer.copyright}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Reusable building blocks ─────────────────────────────────────

function BlueprintTag({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] ${
        dark ? "text-text-soft" : "text-paper/55"
      }`}
    >
      <span className="w-2 h-2 bg-brand" />
      {children}
    </span>
  );
}

function PrimaryCta({
  href,
  children,
  big = false,
}: {
  href: string;
  children: React.ReactNode;
  big?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 bg-brand text-ink font-bold uppercase tracking-wide hover:bg-paper transition-colors ${
        big ? "px-8 py-4 text-lg" : "px-6 py-3.5 text-base"
      }`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
      <ArrowRight className={big ? "w-5 h-5" : "w-4 h-4"} />
    </Link>
  );
}

function SecondaryCta({
  href,
  children,
  big = false,
}: {
  href: string;
  children: React.ReactNode;
  big?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 border-2 border-paper/30 text-paper font-bold uppercase tracking-wide hover:bg-paper hover:text-ink transition-colors ${
        big ? "px-8 py-4 text-lg" : "px-6 py-3.5 text-base"
      }`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </Link>
  );
}

function ProofBlock({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="border-l-2 border-brand pl-5">
      <h3
        className="text-paper"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-lg)",
          textTransform: "uppercase",
          letterSpacing: "0.005em",
          lineHeight: 1.15,
        }}
      >
        {heading}
      </h3>
      <p className="mt-2.5 text-sm sm:text-[15px] text-paper/75 leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function CheckRow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-3 text-sm sm:text-base ${
        dark ? "text-paper/85" : "text-text-strong"
      }`}
    >
      {/* The orange tick aligns to the visual midline of the first text
          line. mt is set in em units so it scales with text-sm/text-base
          and stays centered on the first line for multi-line items. */}
      <span
        className="w-3 h-px bg-brand flex-shrink-0"
        style={{ marginTop: "0.65em" }}
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  );
}

function ProblemCard({
  number,
  title,
  body,
  middle = false,
  prefix,
}: {
  number: string;
  title: string;
  body: string;
  middle?: boolean;
  prefix: string;
}) {
  return (
    <div
      className={`p-8 ${
        middle ? "border-l border-r border-paper/15" : ""
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
        {prefix} · {number}
      </div>
      <h3
        className="mt-4 text-paper"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-xl)",
          textTransform: "uppercase",
          letterSpacing: "0.005em",
          lineHeight: 1.05,
        }}
      >
        {title}
      </h3>
      <p className="mt-3 text-paper/70 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function EstimateTile({
  label,
  caption,
}: {
  label: string;
  caption: string;
}) {
  return (
    <div className="p-5 border-b border-r border-paper/15 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(4n)]:border-r-0 [&:nth-last-child(-n+1)]:border-b-0 sm:[&:nth-last-child(-n+3)]:border-b-0 lg:[&:nth-last-child(-n+4)]:border-b-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/45">
        {caption}
      </div>
      <div
        className="text-paper mt-1.5"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-md)",
          textTransform: "uppercase",
          letterSpacing: "0.005em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function CredentialTile({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption: string;
}) {
  return (
    <div className="p-6 border-r border-line last:border-r-0 md:[&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:md:border-r md:[&:nth-last-child(-n+2)]:border-b-0 [&:nth-child(-n+2)]:border-b [&:nth-child(-n+2)]:md:border-b-0 md:last:border-r-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
        {caption}
      </div>
      <div
        className="mt-2 text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-md)",
          textTransform: "uppercase",
          letterSpacing: "0.005em",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Architectural corner ticks — subtle blueprint accent for hero/visual blocks.
function CornerTicks() {
  return (
    <>
      <span className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-brand pointer-events-none" />
      <span className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-brand pointer-events-none" />
      <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-brand pointer-events-none" />
      <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-brand pointer-events-none" />
    </>
  );
}

// ─── Hero visual: real property photos + measurement chrome ───────

function HeroVisual({ lang }: { lang: Lang }) {
  const h = COPY[lang].mockup.hero;
  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-paper border-2 border-paper/10 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-paper/10 flex items-center justify-between bg-ink/40">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
            {h.projectLabel} · EST-1042
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
            64 LF · 6 FT
          </div>
        </div>
        <div className="grid grid-cols-1">
          <div className="relative aspect-[16/10] bg-slate-800">
            <Image
              src="/landing-preview/before.jpg"
              alt={h.before}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
              priority
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-ink/80 text-paper text-[10px] uppercase tracking-[0.18em] font-bold backdrop-blur">
              {h.before}
            </span>
          </div>
          <div className="h-px bg-brand" />
          <div className="relative aspect-[16/10] bg-ink">
            <Image
              src="/landing-preview/after-aluminum.png"
              alt={h.after}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
              priority
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-brand text-ink text-[10px] uppercase tracking-[0.18em] font-bold">
              {h.after}
            </span>
          </div>
        </div>
        <div className="px-4 py-3 bg-ink/60 border-t border-paper/10 grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
          <div>
            <div className="text-paper/40">{h.styleLabel}</div>
            <div className="text-paper">{h.styleValue}</div>
          </div>
          <div>
            <div className="text-paper/40">{h.folioLabel}</div>
            <div className="text-paper">30-5911-321-1234</div>
          </div>
          <div>
            <div className="text-paper/40">{h.statusLabel}</div>
            <div className="text-brand">{h.statusValue}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estimate mockup: clean, blueprint-feel job sheet ────────────

function EstimateMockup({ lang }: { lang: Lang }) {
  const e = COPY[lang].mockup.estimate;
  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-white text-ink border border-line">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
            {e.estimateLabel} · EST-1042
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
            {e.residence}
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <SpecLine label={e.fenceType} value={e.fenceTypeValue} />
          <SpecLine label={e.linearFeet} value="64 LF" />
          <SpecLine label={e.posts} value={e.postsValue} />
          <SpecLine label={e.concrete} value={e.concreteValue} />
          <SpecLine label={e.singleGates} value={e.gatesValue} />
          <SpecLine label={e.removal} value={e.removalValue} />
          <SpecLine label={e.labor} value={e.laborValue} />
          <SpecLine label={e.margin} value="22%" />
        </div>
        <div className="px-5 py-3 border-t border-line bg-paper flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
            {e.total}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "var(--text-2xl)",
              textTransform: "uppercase",
            }}
          >
            $11,840
          </span>
        </div>
      </div>
    </div>
  );
}

function SpecLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line/60 pb-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
        {label}
      </div>
      <div className="text-ink mt-0.5 font-medium">{value}</div>
    </div>
  );
}

// ─── Worker's Accountability List mockup ──────────────────────

function WorkOrderMockup({ lang }: { lang: Lang }) {
  const a = COPY[lang].mockup.accountability;
  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-paper text-ink border-2 border-paper/10">
        <div className="px-5 py-3 bg-ink text-paper border-b border-paper/10 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
            <ClipboardList className="w-3 h-3 text-brand" />
            {a.header}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
            {a.crew}
          </div>
        </div>
        <div className="bg-white p-5 space-y-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
              {a.job}
            </div>
            <div
              className="text-ink mt-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-lg)",
                textTransform: "uppercase",
                letterSpacing: "0.005em",
              }}
            >
              {a.jobValue}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <WorkRow icon={<Ruler className="w-3 h-3 text-brand" />} label={a.linearFeet} value="64 LF" />
            <WorkRow icon={<Hammer className="w-3 h-3 text-brand" />} label={a.posts} value="24" />
            <WorkRow icon={<Calendar className="w-3 h-3 text-brand" />} label={a.installDate} value={a.installDateValue} />
            <WorkRow icon={<MapPin className="w-3 h-3 text-brand" />} label={a.gate} value={a.gateValue} />
          </div>
          <div className="border-t border-line pt-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft mb-2">
              {a.siteNotes}
            </div>
            <ul className="space-y-1.5 text-sm text-ink">
              <li className="flex gap-2">
                <span className="text-brand">·</span>
                {a.note1}
              </li>
              <li className="flex gap-2">
                <span className="text-brand">·</span>
                {a.note2}
              </li>
              <li className="flex gap-2">
                <span className="text-brand">·</span>
                {a.note3}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-line p-3">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-ink font-semibold">{value}</div>
    </div>
  );
}

// ─── Pricing tier card ─────────────────────────────────────────

function PricingTier({
  name,
  price,
  tagline,
  features,
  cta,
  featured = false,
  monthlyLabel,
  mostPopLabel,
  lang,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
  monthlyLabel: string;
  mostPopLabel: string;
  lang: Lang;
}) {
  return (
    <div
      className={`flex flex-col p-6 border-2 ${
        featured
          ? "border-brand bg-paper text-ink lg:py-10 lg:-my-4 relative z-10 shadow-[0_18px_44px_-14px_rgba(0,0,0,0.55)]"
          : "border-paper/15 bg-ink text-paper"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={featured ? "text-ink" : "text-paper"}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "var(--text-xl)",
            textTransform: "uppercase",
            letterSpacing: "0.005em",
          }}
        >
          {name}
        </div>
        {featured && (
          <span className="px-2 py-0.5 bg-brand text-ink font-mono text-[9px] uppercase tracking-[0.22em] font-bold">
            {mostPopLabel}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "var(--text-3xl)",
            letterSpacing: "0.005em",
          }}
        >
          {price}
        </span>
        {price !== "Custom" && price !== "A medida" && (
          <span className={`text-xs font-mono uppercase tracking-[0.18em] ${featured ? "text-text-soft" : "text-paper/55"}`}>
            {monthlyLabel}
          </span>
        )}
      </div>
      <p className={`mt-2 text-sm ${featured ? "text-text-soft" : "text-paper/70"}`}>
        {tagline}
      </p>
      <ul className="mt-5 space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 w-2.5 h-px bg-brand flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/book-demo?lang=${lang}`}
        className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 font-bold uppercase tracking-wide text-sm transition-colors ${
          featured
            ? "bg-ink text-paper hover:bg-brand hover:text-ink"
            : "border-2 border-paper/30 text-paper hover:bg-paper hover:text-ink"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {cta}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/45 mb-3">
        {title}
      </div>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-paper/80 hover:text-brand transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
