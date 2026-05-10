import Image from "next/image";
import Link from "next/link";
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
import PermitAutofillSpot from "@/components/PermitAutofillSpot";
import {
  GateSwingMark,
  SitePlanCorner,
} from "@/components/FenceBlueprintMark";

export const metadata = {
  title:
    "Fence Quote Pros — The modern operating platform for fence contractors",
  description:
    "Quote, visualize, and close fence projects faster. Built for fence contractors — material calculations, property visualizations, permit-ready workflows, and worker's accountability lists, in one platform.",
};

export default function LandingPage() {
  return (
    <div className="-mx-4 -my-8 bg-paper">
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div>
            <BlueprintTag>
              <BrandWordmark tm />
              {" "}· Field-tested workflows
            </BlueprintTag>
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
              Quote.
              <br />
              <span className="text-brand">Visualize.</span>
              <br />
              Close.
            </h1>
            <p className="mt-6 max-w-xl text-lg sm:text-xl text-paper/80 leading-relaxed">
              The all-in-one platform built specifically for fence contractors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryCta href="/book-demo">Book demo</PrimaryCta>
              <SecondaryCta href="/signup">Start free trial</SecondaryCta>
            </div>
            <div className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
              <span className="w-6 h-px bg-brand" />
              No credit card · 20-min walkthrough
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ─── SIGNAL STRIP — operational coverage, not testimonials ── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 items-center">
            <SignalCell label="Built for" value="Florida fence pros" />
            <SignalCell label="Coverage" value="Lead → Permit → Install" />
            <SignalCell label="Calculator" value="Linear-foot · per-gate" />
            <SignalCell label="Specs" value="Aluminum · PVC · Wood · Chain" />
          </div>
        </div>
      </section>

      {/* ─── SECTION 2 — COMMON CHALLENGES ───────────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <BlueprintTag>Common challenges</BlueprintTag>
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
              Three common problems{" "}
              <span className="text-brand">cost fence companies money.</span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-0 border border-paper/15">
            <ProblemCard
              number="01"
              title="Slow estimates"
              body="Manual quotes waste valuable sales time. Customers often move forward with the contractor who responds first."
            />
            <ProblemCard
              number="02"
              title="Homeowners can't visualize"
              body="Customers hesitate when they cannot clearly see how the finished fence will look on their property."
              middle
            />
            <ProblemCard
              number="03"
              title="Operational confusion"
              body="Miscommunication between sales and installers leads to wrong gates, incorrect heights, delays, and costly rework."
            />
          </div>

          <div className="mt-10 max-w-3xl space-y-2 text-base leading-relaxed">
            <p className="font-semibold">
              <BrandWordmark />
              {" "}simplifies the entire workflow.
            </p>
            <p className="text-paper/75">
              Professional quoting, realistic fence visualization, permits, and
              worker&apos;s accountability lists — connected in one platform.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — VISUAL FENCE PREVIEW (FLAGSHIP) ─────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <BlueprintTag dark>Property visualization</BlueprintTag>
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
              Show customers exactly{" "}
              <span className="text-brand">what they&apos;re buying.</span>
            </h2>
            <p className="mt-6 text-lg text-text-soft leading-relaxed max-w-xl">
              Create realistic fence visualizations directly from property
              photos. Your customers see the finished fence on their own home
              before they sign — no guesswork, no buyer&apos;s remorse, no
              hesitation at the close.
            </p>
            <ul className="mt-8 space-y-3 max-w-md">
              <CheckRow>Real property photos, not generic mockups</CheckRow>
              <CheckRow>Multiple fence styles per quote</CheckRow>
              <CheckRow>Aluminum, PVC, and wood</CheckRow>
              <CheckRow>Side-by-side options for upsells</CheckRow>
            </ul>
            <div className="mt-10 inline-flex items-center gap-3 border border-ink px-4 py-2 bg-white">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
                Outcome
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
                Higher close rates
              </span>
            </div>
          </div>

          <div className="relative">
            <SitePlanCorner className="absolute -top-6 -right-6 w-12 h-12 text-brand pointer-events-none" />
            <CornerTicks />
            <BeforeAfterVisual />
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 — SMART ESTIMATING ────────────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <AnimatedFenceMark className="text-brand/70 w-48 mb-8" />
          <div className="max-w-2xl">
            <BlueprintTag>Smart estimating</BlueprintTag>
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
              Built for{" "}
              <span className="text-brand">real fence contractors.</span>
            </h2>
            <p className="mt-5 text-paper/75 text-lg leading-relaxed">
              Created by contractors who understand real-world fence
              estimating. Not generic line-item software repurposed for the
              trades.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 border border-paper/15">
            <EstimateTile label="Materials" />
            <EstimateTile label="Posts + Concrete" />
            <EstimateTile label="Gates + Hardware" />
            <EstimateTile label="Labor" />
            <EstimateTile label="Demolition" />
            <EstimateTile label="Margins" />
            <EstimateTile label="Fence Styles" />
            <EstimateTile label="Job Costing" />
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
            <ul className="space-y-3 text-paper/85">
              <CheckRow dark>Per-foot or fixed-margin pricing</CheckRow>
              <CheckRow dark>Wood, vinyl, aluminum, and chain-link</CheckRow>
              <CheckRow dark>Single + double gates with motors</CheckRow>
              <CheckRow dark>Removal &amp; haul-away built in</CheckRow>
            </ul>
            <EstimateMockup />
          </div>
        </div>
      </section>

      {/* ─── SECTION 5 — PERMIT-READY WORKFLOWS ──────────────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <BlueprintTag dark>Permitting</BlueprintTag>
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
              Permit-ready{" "}
              <span className="text-brand">project workflows.</span>
            </h2>
            <p className="mt-5 text-lg text-text-soft leading-relaxed">
              Generate organized project documentation faster and reduce
              administrative delays. Your packets are ready when the customer
              signs — not three days later.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
              <CheckRow>Faster turnarounds</CheckRow>
              <CheckRow>Cleaner submissions</CheckRow>
              <CheckRow>Fewer corrections from the building department</CheckRow>
              <CheckRow>Professional presentation, every time</CheckRow>
            </ul>
          </div>

          <div className="mt-12 sm:mt-16">
            <div className="mb-4 flex items-center justify-between">
              <BlueprintTag dark>Live demo · 36 s</BlueprintTag>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-soft">
                Permit Autofill
              </span>
            </div>
            <PermitAutofillSpot />
          </div>
        </div>
      </section>

      {/* ─── SECTION 5b — PRODUCTION SCHEDULING ─────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_1.15fr] gap-14 items-center">
          <div>
            <BlueprintTag>Production scheduling</BlueprintTag>
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
              Your whole week{" "}
              <span className="text-brand">on one board.</span>
            </h2>
            <p className="mt-5 text-lg text-paper/80 leading-relaxed max-w-xl">
              Slot accepted jobs into crew calendars, see who&apos;s booked
              and who&apos;s open at a glance, and walk every install from
              scheduled to complete without leaving the page.
            </p>
            <ul className="mt-8 space-y-3 max-w-md">
              <CheckRow dark>Day × crew week grid — every install in one view</CheckRow>
              <CheckRow dark>Unscheduled column for accepted jobs awaiting a date</CheckRow>
              <CheckRow dark>Status flow: scheduled → in progress → complete</CheckRow>
              <CheckRow dark>Crew capacity at a glance — no double-booked Tuesdays</CheckRow>
            </ul>
          </div>

          <AnimatedScheduleMockup />
        </div>
      </section>

      {/* ─── SECTION 6 — INSTALLER WORK ORDERS ───────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-14 items-center">
          <WorkOrderMockup />

          <div>
            <div className="flex items-center gap-3">
              <BlueprintTag>Field operations</BlueprintTag>
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
              Worker&apos;s{" "}
              <span className="text-brand">accountability list.</span>
            </h2>
            <p className="mt-5 text-lg text-paper/80 leading-relaxed max-w-xl">
              Reduce installer confusion and keep crews aligned in the field.
              Every detail the crew needs — measurements, gate hardware, fence
              style, materials, photos — in one packet they can pull up on
              the truck.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 max-w-lg">
              <CheckRow dark>Measurements</CheckRow>
              <CheckRow dark>Gate details</CheckRow>
              <CheckRow dark>Fence style</CheckRow>
              <CheckRow dark>Material breakdowns</CheckRow>
              <CheckRow dark>Job notes</CheckRow>
              <CheckRow dark>Site photos</CheckRow>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7 — TRUST / AUTHENTICITY ───────────────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <BlueprintTag dark>Built by the industry</BlueprintTag>
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
            Designed by professionals with{" "}
            <span className="text-brand">real fence experience.</span>
          </h2>
          <p className="mt-6 text-lg text-text-soft leading-relaxed max-w-3xl mx-auto">
            Permitting. Estimating. Installation. Inspections. Field operations.{" "}
            <BrandWordmark />
            {" "}was built by people who&apos;ve done all of it — and got tired
            of running fence companies on phone calls and spreadsheets.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 border border-line bg-white">
            <CredentialTile>Permitting expertise</CredentialTile>
            <CredentialTile>Inspection-ready specs</CredentialTile>
            <CredentialTile>Production management</CredentialTile>
            <CredentialTile>Field operations</CredentialTile>
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <BlueprintTag>Pricing</BlueprintTag>
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
              Operational infrastructure{" "}
              <span className="text-brand">for serious contractors.</span>
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <PricingTier
              name="Starter"
              price="$99"
              tagline="CRM, estimates, proposals."
              features={[
                "CRM + customer database",
                "Estimates & digital proposals",
                "Basic scheduling",
                "Up to 2 users",
              ]}
              cta="Book demo"
            />
            <PricingTier
              name="Pro"
              price="$249"
              tagline="Production-ready operations."
              features={[
                "Everything in Starter",
                "Worker's accountability list",
                "Material calculations",
                "Crew scheduling + production board",
                "Team management",
              ]}
              cta="Book demo"
              featured
            />
            <PricingTier
              name="Performance"
              price="$499"
              tagline="The full operating platform."
              features={[
                "Everything in Pro",
                "Property visualization",
                "Permit-ready workflows",
                "HOA application packets",
                "Advanced job costing",
              ]}
              cta="Book demo"
            />
            <PricingTier
              name="Enterprise"
              price="Custom"
              tagline="Multi-location · API · white label."
              features={[
                "Everything in Performance",
                "Multi-location support",
                "API access",
                "Onboarding + training",
                "Dedicated support",
              ]}
              cta="Contact sales"
            />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────── */}
      <section className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <BlueprintTag>Get started</BlueprintTag>
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
            The modern way to{" "}
            <span className="text-brand">run a fence company.</span>
          </h2>
          <p className="mt-6 text-lg text-paper/80 max-w-2xl mx-auto">
            Quote faster. Win more jobs. Keep crews aligned. See it on a real
            project — book a 20-minute walkthrough with our team.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <PrimaryCta href="/book-demo" big>
              Book demo
            </PrimaryCta>
            <SecondaryCta href="/signup" big>
              Start free trial
            </SecondaryCta>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-ink text-paper">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            <div className="text-xs opacity-60 max-w-xs leading-relaxed">
              The modern operating platform for fence contractors. Built in
              Miami. Shipping nationwide.
            </div>
          </div>
          <FooterCol
            title="Platform"
            links={[
              ["Visualization", "/landing#"],
              ["Estimating", "/landing#"],
              ["Permits", "/landing#"],
              ["Scheduling", "/landing#"],
              ["Accountability List", "/landing#"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["Book demo", "/book-demo"],
              ["Pricing", "/landing#pricing"],
              ["Contact", "mailto:victor@permitsolutions.us"],
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              ["Sign in", "/login"],
              ["Privacy", "#"],
              ["Terms", "#"],
            ]}
          />
        </div>
        <div className="border-t border-paper/10">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs opacity-60 flex items-center gap-1.5">
            <span>© {new Date().getFullYear()}</span>
            <BrandWordmark />
            <span>. All rights reserved.</span>
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

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-l-2 border-brand/70 pl-3">
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/45">
          {label}
        </div>
        <div
          className="text-paper mt-0.5"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "var(--text-md)",
            textTransform: "uppercase",
            letterSpacing: "0.005em",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
      </div>
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
}: {
  number: string;
  title: string;
  body: string;
  middle?: boolean;
}) {
  return (
    <div
      className={`p-8 ${
        middle ? "border-l border-r border-paper/15" : ""
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
        Problem · {number}
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

function EstimateTile({ label }: { label: string }) {
  return (
    <div className="p-5 border-b border-r border-paper/15 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(4n)]:border-r-0 [&:nth-last-child(-n+1)]:border-b-0 sm:[&:nth-last-child(-n+3)]:border-b-0 lg:[&:nth-last-child(-n+4)]:border-b-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/45">
        Module
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

function CredentialTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 border-r border-line last:border-r-0 md:[&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:md:border-r md:[&:nth-last-child(-n+2)]:border-b-0 [&:nth-child(-n+2)]:border-b [&:nth-child(-n+2)]:md:border-b-0 md:last:border-r-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
        Credential
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

function HeroVisual() {
  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-paper border-2 border-paper/10 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-paper/10 flex items-center justify-between bg-ink/40">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
            Project · EST-1042
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
            64 LF · 6 FT
          </div>
        </div>
        <div className="grid grid-cols-1">
          <div className="relative aspect-[16/10] bg-slate-800">
            <Image
              src="/landing-preview/before.jpg"
              alt="Property before fence install"
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
              priority
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-ink/80 text-paper text-[10px] uppercase tracking-[0.18em] font-bold backdrop-blur">
              Before
            </span>
          </div>
          <div className="h-px bg-brand" />
          <div className="relative aspect-[16/10] bg-ink">
            <Image
              src="/landing-preview/after-aluminum.png"
              alt="Property after fence install — aluminum louvered"
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
              priority
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-brand text-ink text-[10px] uppercase tracking-[0.18em] font-bold">
              After
            </span>
          </div>
        </div>
        <div className="px-4 py-3 bg-ink/60 border-t border-paper/10 grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
          <div>
            <div className="text-paper/40">Style</div>
            <div className="text-paper">Aluminum</div>
          </div>
          <div>
            <div className="text-paper/40">Folio</div>
            <div className="text-paper">30-4029-001</div>
          </div>
          <div>
            <div className="text-paper/40">Status</div>
            <div className="text-brand">Approved</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estimate mockup: clean, blueprint-feel job sheet ────────────

function EstimateMockup() {
  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-white text-ink border border-line">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
            Estimate · EST-1042
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
            Sanchez residence
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <SpecLine label="Fence type" value="6′ Aluminum louvered" />
          <SpecLine label="Linear feet" value="64 LF" />
          <SpecLine label="Posts" value="24 × 2.5″ × 8′" />
          <SpecLine label="Concrete" value="48 bags / 80 lb" />
          <SpecLine label="Single gates" value="1 × 4′ swing" />
          <SpecLine label="Removal" value="62 LF chain-link" />
          <SpecLine label="Labor" value="32 hr · 2 crew" />
          <SpecLine label="Margin" value="22%" />
        </div>
        <div className="px-5 py-3 border-t border-line bg-paper flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
            Total
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

function WorkOrderMockup() {
  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-paper text-ink border-2 border-paper/10">
        <div className="px-5 py-3 bg-ink text-paper border-b border-paper/10 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
            <ClipboardList className="w-3 h-3 text-brand" />
            Worker&apos;s accountability list
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
            Crew · A-1
          </div>
        </div>
        <div className="bg-white p-5 space-y-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft">
              Job
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
              Sanchez · 4502 SW 92nd Ave
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <WorkRow icon={<Ruler className="w-3 h-3 text-brand" />} label="Linear feet" value="64 LF" />
            <WorkRow icon={<Hammer className="w-3 h-3 text-brand" />} label="Posts" value="24" />
            <WorkRow icon={<Calendar className="w-3 h-3 text-brand" />} label="Install date" value="Tue · 06/04" />
            <WorkRow icon={<MapPin className="w-3 h-3 text-brand" />} label="Gate" value="4′ swing · East" />
          </div>
          <div className="border-t border-line pt-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-soft mb-2">
              Site notes
            </div>
            <ul className="space-y-1.5 text-sm text-ink">
              <li className="flex gap-2">
                <span className="text-brand">·</span>
                Avoid sprinkler line along south property edge
              </li>
              <li className="flex gap-2">
                <span className="text-brand">·</span>
                Customer requests photos sent before pour
              </li>
              <li className="flex gap-2">
                <span className="text-brand">·</span>
                Gate opens out toward driveway
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
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col p-6 border-2 ${
        featured
          ? "border-brand bg-paper text-ink"
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
            Most Pop.
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
        {price !== "Custom" && (
          <span className={`text-xs font-mono uppercase tracking-[0.18em] ${featured ? "text-text-soft" : "text-paper/55"}`}>
            / mo
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
        href="/book-demo"
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
