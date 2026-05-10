import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  FileSignature,
  FileText,
  Hammer,
  Image as ImageIcon,
  Languages,
  MapPin,
  Package,
  PenLine,
  PlayCircle,
  Ruler,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

export const metadata = {
  title:
    "Fence Quote Pros — The Operating System for Modern Fence Contractors",
  description:
    "Quotes, permits, AI visualizations, work orders, scheduling, production tracking, and municipality automation — all in one platform built specifically for fence companies.",
};

export default function LandingPage() {
  return (
    <div className="-mx-4 -my-8 bg-paper">
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section
        id="product"
        className="relative bg-ink text-paper overflow-hidden border-b border-paper/10"
      >
        <div className="absolute inset-0 -z-0 opacity-[0.06] pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-brand blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 grid lg:grid-cols-[1.05fr_1.2fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-paper/20 text-xs uppercase tracking-wider mb-6 font-semibold text-paper">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Built by fence contractors · For fence contractors
            </div>
            <h1
              className="text-paper"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(40px, 5.8vw, 80px)",
                lineHeight: 0.95,
                letterSpacing: "0.005em",
              }}
            >
              The{" "}
              <span className="text-brand">operating system</span> for
              modern fence contractors.
            </h1>
            <p className="text-lg sm:text-xl mt-6 max-w-xl text-paper/80 leading-relaxed">
              AI-powered quoting, permit workflows, municipality intelligence,
              production management, and installer accountability — all in one
              platform built specifically for fence companies.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md bg-brand text-ink font-bold uppercase tracking-wide hover:bg-paper transition-colors text-base"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Book a demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#platform"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md border-2 border-paper/30 text-paper font-bold uppercase tracking-wide hover:bg-paper hover:text-ink transition-colors text-base"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <PlayCircle className="w-4 h-4" />
                Watch platform demo
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-paper/10 grid grid-cols-3 gap-6 max-w-md">
              <Stat label="Lifecycle coverage" value="Lead → install" />
              <Stat label="Permit automation" value="Auto-fill" />
              <Stat label="Built for FL" value="305 / 786" />
            </div>
          </div>

          <HeroDashboard />
        </div>
      </section>

      {/* ─── THE OLD WAY (Industry Chaos) ──────────────────────── */}
      <section className="relative bg-ink text-paper border-b border-paper/10 overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-[0.05] pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-paper/15 text-[10px] uppercase tracking-[0.2em] mb-4 font-mono text-paper/60">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Fence industry · 2026
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              The old way is{" "}
              <span className="text-brand">costing fence companies money.</span>
            </h2>
            <p className="text-base text-paper/60 mt-5 leading-relaxed">
              Phone calls. Sticky notes. Tape measures. Spreadsheets that
              don't sync. The status quo bleeds margin every job.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <ProblemCard
              icon={<Clock className="w-5 h-5" />}
              title="Slow estimates"
              body="Three-day turnaround on a quote. The customer signs with the contractor who responded that night."
            />
            <ProblemCard
              icon={<FileText className="w-5 h-5" />}
              title="Permit confusion"
              body="Is this Coral Gables or Unincorporated MDC? Which addendum is required? Nobody on the truck knows."
            />
            <ProblemCard
              icon={<Hammer className="w-5 h-5" />}
              title="Installer mistakes"
              body="Crew shows up, gate is on the wrong side, height is wrong, post spacing won't pass inspection."
            />
            <ProblemCard
              icon={<Package className="w-5 h-5" />}
              title="Material errors"
              body="Truck rolls without enough posts. Half-day lost driving back to the yard. Margin gone."
            />
            <ProblemCard
              icon={<Bell className="w-5 h-5" />}
              title="Missed leads"
              body="Web inquiries sat in spam. Voicemails not returned for two days. The job's already booked elsewhere."
            />
            <ProblemCard
              icon={<Workflow className="w-5 h-5" />}
              title="Communication breakdowns"
              body="Office tells one story, sales rep tells another, installer hears a third. Customer is confused."
            />
            <ProblemCard
              icon={<DollarSign className="w-5 h-5" />}
              title="Inconsistent pricing"
              body="Three reps quoting the same fence three different ways. Margin leaks every job, and you don't know where."
            />
            <ProblemCard
              icon={<Truck className="w-5 h-5" />}
              title="Production bottlenecks"
              body="Crews idle waiting for materials. Materials arrive after the crew left. Schedule slipping by the day."
            />
            <ProblemCard
              icon={<Ruler className="w-5 h-5" />}
              title="Manual measurements"
              body="Every estimate is a tape measure on a clipboard, retyped into a Word doc, emailed as a PDF."
            />
          </div>
        </div>
      </section>

      {/* ─── BUILT BY FENCE CONTRACTORS ─────────────────────────── */}
      <section className="relative bg-ink text-paper border-b border-paper/10 overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-[0.05] pointer-events-none">
          <div className="absolute -bottom-40 right-1/4 w-[700px] h-[400px] rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 items-center">
            <div>
              <div className="aspect-square rounded-2xl bg-ink overflow-hidden relative shadow-[10px_10px_0_var(--brand)]">
                <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-deep to-brand-dark opacity-90" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-paper/10 border border-paper/15 text-[10px] uppercase tracking-[0.2em] font-mono text-paper/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Founders
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Hammer className="w-32 h-32 text-brand opacity-90" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-paper text-center">
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      fontSize: "var(--text-lg)",
                      letterSpacing: "0.005em",
                    }}
                  >
                    Real fence contractors
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-brand font-bold mb-3 font-mono">
                Built by fence contractors
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontSize: "clamp(30px, 4.6vw, 56px)",
                  lineHeight: 1,
                  letterSpacing: "0.005em",
                }}
              >
                Not built by software developers guessing how contractors work.
              </h2>
              <p className="text-base text-paper/75 mt-5 leading-relaxed">
                Fence Quote Pros was built by real fence contractors who
                understand permits, callbacks, production delays, installers,
                and operational chaos — because we live it every day.
              </p>
              <p className="text-base text-paper/75 mt-4 leading-relaxed">
                The platform reflects how fence companies actually run — not
                how a generic SaaS team imagined they should. That's the
                difference between contractor software people use, and
                operational infrastructure people pay for.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <ContractorPoint>Permitting expertise</ContractorPoint>
                <ContractorPoint>Inspection experience</ContractorPoint>
                <ContractorPoint>Production management</ContractorPoint>
                <ContractorPoint>Field operations</ContractorPoint>
                <ContractorPoint>Code compliance</ContractorPoint>
                <ContractorPoint>AHJ workflows</ContractorPoint>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PLATFORM ───────────────────────────────────────── */}
      <section id="platform" className="bg-ink text-paper border-b border-paper/10">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              The platform
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              Run your entire fence operation{" "}
              <span className="text-brand">from one platform.</span>
            </h2>
            <p className="text-lg text-paper/70 mt-5">
              Lead → Estimate → Permit → Production → Install → Completion.
              The full operational pipeline, connected.
            </p>
          </div>

          <LifecyclePipeline />

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PlatformModule icon={<Users className="w-5 h-5" />} label="CRM" />
            <PlatformModule icon={<Ruler className="w-5 h-5" />} label="Quoting" />
            <PlatformModule icon={<MapPin className="w-5 h-5" />} label="Permit Intel" />
            <PlatformModule icon={<ImageIcon className="w-5 h-5" />} label="Visualization" />
            <PlatformModule icon={<ClipboardList className="w-5 h-5" />} label="Accountability" />
            <PlatformModule icon={<Calendar className="w-5 h-5" />} label="Scheduling" />
            <PlatformModule icon={<Wrench className="w-5 h-5" />} label="Production" />
            <PlatformModule icon={<CreditCard className="w-5 h-5" />} label="Payments" />
          </div>
        </div>
      </section>

      {/* ─── PREMIUM FEATURES ────────────────────────────────────── */}
      <section className="relative bg-ink text-paper border-b border-paper/10 overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-[0.04] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-brand blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-24 space-y-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              Premium features
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              The four features that{" "}
              <span className="text-brand">run modern fence companies.</span>
            </h2>
          </div>

          {/* FEATURE 1 — Fence Visualization */}
          <FeatureBlock
            badge="Sales visualization"
            title="Show customers their fence"
            highlight="before it's built."
            body="Upload a property photo. Pick a style. The system overlays the fence onto the real backyard. Quote updates in real time. Homeowners stop guessing — they start signing."
            bullets={[
              "Property photo overlays",
              "Side-by-side upgrades",
              "Style + color swaps",
              "Higher close rates",
              "Bigger ticket size",
              "Premium presentation tools",
            ]}
            metric={{ value: "2–3×", label: "close-rate uplift" }}
            visual={<BeforeAfterVisual />}
            reverse={false}
          />

          {/* FEATURE 2 — Municipality Intelligence */}
          <FeatureBlock
            badge="Municipality intelligence"
            title="Permit workflows"
            highlight="automated by address."
            body="Drop in the address. The system identifies the jurisdiction, tells you which permit is required, generates the documents, and flags the gotchas before you submit."
            bullets={[
              "Auto-detect jurisdiction",
              "Permit requirements per address",
              "Setback + height rules",
              "Auto-fill applications",
              "Generate full permit packets",
              "Zoning awareness",
            ]}
            metric={{ value: "Days", label: "saved per packet" }}
            visual={<PermitIntelVisual />}
            reverse={true}
          />

          {/* FEATURE 3 — Accountability Lists */}
          <FeatureBlock
            badge="Accountability lists"
            title="Eliminate"
            highlight="installer confusion."
            body="When the crew rolls out, every detail is in their hand: scope, gate locations, exact measurements, materials, post counts, concrete quantities, and site photos. No call-backs to the office, no wrong gates, no rework."
            bullets={[
              "Scope details",
              "Gate locations + swing",
              "Exact measurements",
              "Materials + post counts",
              "Concrete quantities",
              "Site photos",
            ]}
            metric={{ value: "Fewer", label: "callbacks per job" }}
            visual={<AccountabilityVisual />}
            reverse={false}
          />

          {/* FEATURE 4 — Production Workflow */}
          <FeatureBlock
            badge="Production workflow"
            title="From signed quote"
            highlight="to completed install."
            body="Once the contract is signed, production takes over. Crew assignment, scheduling, work orders, material tracking, and status updates — visible to the office and the crew in real time."
            bullets={[
              "Crew assignment",
              "Scheduling",
              "Work orders",
              "Material tracking",
              "Status updates",
              "Real-time visibility",
            ]}
            metric={{ value: "Real-time", label: "production visibility" }}
            visual={<ProductionVisual />}
            reverse={true}
          />
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="relative bg-ink text-paper border-b border-paper/10 overflow-hidden"
      >
        <div className="absolute inset-0 -z-0 opacity-[0.05] pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              Pricing
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(28px, 4.4vw, 52px)",
                lineHeight: 1,
                letterSpacing: "0.005em",
              }}
            >
              Operational infrastructure for serious contractors.
            </h2>
            <p className="text-base text-paper/70 mt-4">
              Most teams land on Pro. Performance unlocks the full operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PricingTier
              name="Starter"
              price="$99"
              priceUnit="/ month"
              tagline="CRM, estimates, proposals."
              features={[
                "CRM + customer database",
                "Estimates & digital proposals",
                "Basic scheduling",
                "Up to 2 users",
                "Limited jobs / month",
              ]}
              cta="Talk to sales"
              ctaHref="/book-demo"
            />
            <PricingTier
              name="Pro"
              price="$249"
              priceUnit="/ month"
              tagline="Production-ready operations."
              features={[
                "Everything in Starter",
                "Work orders",
                "Accountability lists",
                "Measurements + production workflows",
                "Material calculations",
                "Automation",
                "Team management",
              ]}
              cta="Book a demo"
              ctaHref="/book-demo"
              featured
            />
            <PricingTier
              name="Performance"
              price="$499"
              priceUnit="/ month"
              tagline="Full operating system. Moat unlocked."
              features={[
                "Everything in Pro",
                "Municipality intelligence",
                "Permit autofill",
                "Fence visualization",
                "Permit packet generation",
                "Advanced workflows",
                "Crew operations",
              ]}
              cta="Book a demo"
              ctaHref="/book-demo"
            />
            <PricingTier
              name="Enterprise"
              price="Custom"
              tagline="Multi-location, white-label, API."
              features={[
                "Everything in Performance",
                "White label",
                "API access",
                "Multi-location support",
                "Onboarding + training",
                "Dedicated support",
                "Custom integrations",
              ]}
              cta="Contact sales"
              ctaHref="/book-demo"
            />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────── */}
      <section className="relative bg-ink text-paper overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-[0.07] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-paper/15 text-[10px] uppercase tracking-[0.2em] mb-6 font-mono text-paper/60">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Operational infrastructure · Built for fence contractors
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "clamp(36px, 5.6vw, 72px)",
              lineHeight: 0.95,
              letterSpacing: "0.005em",
            }}
          >
            Give your fence business{" "}
            <span className="text-brand">the operating system it deserves.</span>
          </h2>
          <p className="text-lg sm:text-xl mt-6 opacity-80 max-w-2xl mx-auto leading-relaxed">
            Stop running on phone calls and clipboards. Start running on infrastructure.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/book-demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-brand text-ink font-bold uppercase tracking-wide hover:bg-paper transition-colors text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Book a demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#platform"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md border-2 border-paper/30 text-paper font-bold uppercase tracking-wide hover:bg-paper hover:text-ink transition-colors text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <PlayCircle className="w-5 h-5" />
              Watch platform demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-ink text-paper border-t border-paper/10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            <div className="mb-3">
              <Image
                src="/logo-v2.png"
                alt="Fence Quote Pros"
                width={1536}
                height={1024}
                className="h-12 w-auto"
              />
            </div>
            <div className="text-xs opacity-60 max-w-xs leading-relaxed">
              The operating system for modern fence contractors. Built in
              Miami by real fence contractors, shipping nationwide.
            </div>
          </div>
          <FooterCol
            title="Platform"
            links={[
              ["Visualization", "/landing#platform"],
              ["Permit Intel", "/landing#platform"],
              ["Accountability", "/landing#platform"],
              ["Production", "/landing#platform"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["Book a demo", "/book-demo"],
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
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs opacity-60">
            © {new Date().getFullYear()} Fence Quote Pros. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Hero stats ────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-paper"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "var(--text-lg)",
          letterSpacing: "0.005em",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-paper/50 font-semibold mt-1">
        {label}
      </div>
    </div>
  );
}

// ── Hero dashboard mockup ────────────────────────────────────────

function HeroDashboard() {
  return (
    <div className="relative">
      <div className="rounded-xl bg-white border border-line shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="bg-paper border-b border-line px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex-1 text-center">
            <div className="inline-block px-3 py-0.5 rounded-md bg-white border border-line text-[10px] text-slate-500 font-mono">
              fencequotepros.com / projects / EST-1042
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Project
            </div>
            <div
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "var(--text-lg)",
                letterSpacing: "0.005em",
              }}
            >
              EST-1042 · Sanchez residence
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] uppercase tracking-wider font-bold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Lead → Production
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-paper">
          <div className="bg-white rounded-lg border border-line p-3 col-span-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
              <MapPin className="w-3 h-3 text-brand" />
              Property + jurisdiction detected
            </div>
            <div className="text-sm font-medium text-ink">
              4502 SW 92nd Ave, Miami, FL 33165
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Folio 30-4029-001-0010 · Unincorporated MDC · R-1 · HVHZ
            </div>
          </div>

          <div className="bg-white rounded-lg border border-line p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <Hammer className="w-3 h-3 text-brand" />
              Fence
            </div>
            <div className="text-sm font-bold text-ink">
              6 ft Wood Privacy
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Shadow-box · cedar · 184 LF
            </div>
          </div>

          <div className="bg-white rounded-lg border border-line p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <ClipboardList className="w-3 h-3 text-brand" />
              Accountability list
            </div>
            <div className="text-sm font-bold text-ink">Generated</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              23 posts · 2 corners · 1 gate
            </div>
          </div>

          <div className="bg-white rounded-lg border border-line p-3 col-span-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <ImageIcon className="w-3 h-3 text-brand" />
              Fence visualization
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-[16/10] rounded-md bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 relative">
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-ink/80 text-paper text-[8px] uppercase tracking-wider font-bold">
                  Before
                </div>
              </div>
              <div className="aspect-[16/10] rounded-md bg-gradient-to-br from-amber-100 via-orange-200 to-orange-300 relative">
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-brand text-ink text-[8px] uppercase tracking-wider font-bold">
                  After
                </div>
                <div className="absolute inset-x-0 bottom-2 flex items-end justify-around opacity-40">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-amber-900 rounded-t"
                      style={{ height: `${50 + (i % 3) * 4}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-line p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <ShieldCheck className="w-3 h-3 text-brand" />
              Permit packet
            </div>
            <div className="text-xs font-semibold text-emerald-700">
              Auto-filled · 4 docs
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              MDC §33-11
            </div>
          </div>

          <div className="bg-ink rounded-lg p-3 text-paper">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60 font-semibold mb-2">
              <DollarSign className="w-3 h-3 text-brand" />
              Project total
            </div>
            <div
              className="text-paper"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "var(--text-2xl)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              $7,840
            </div>
            <div className="text-[11px] text-paper/60 mt-0.5">
              50% deposit · in production
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Industry problem card ───────────────────────────────────────

function ProblemCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg bg-paper/[0.04] border border-paper/10 p-5 hover:border-brand/40 hover:bg-paper/[0.06] transition-colors">
      <div className="w-10 h-10 rounded-md bg-paper/10 flex items-center justify-center text-brand mb-4">
        {icon}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "var(--text-md)",
          letterSpacing: "0.005em",
        }}
      >
        {title}
      </div>
      <p className="text-sm text-paper/60 mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

// ── Built by Contractors checkmarks ─────────────────────────────

function ContractorPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="w-4 h-4 text-brand shrink-0" strokeWidth={3} />
      <span className="font-semibold text-paper">{children}</span>
    </li>
  );
}

// ── Lifecycle pipeline (The Platform section) ───────────────────

function LifecyclePipeline() {
  const steps = [
    { icon: <Bell className="w-4 h-4" />, label: "Lead" },
    { icon: <MapPin className="w-4 h-4" />, label: "Property" },
    { icon: <ImageIcon className="w-4 h-4" />, label: "Visualize" },
    { icon: <Ruler className="w-4 h-4" />, label: "Estimate" },
    { icon: <FileSignature className="w-4 h-4" />, label: "Contract" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "Permit" },
    { icon: <Calendar className="w-4 h-4" />, label: "Schedule" },
    { icon: <ClipboardList className="w-4 h-4" />, label: "Accountability" },
    { icon: <Wrench className="w-4 h-4" />, label: "Install" },
    { icon: <Check className="w-4 h-4" />, label: "Finalize" },
    { icon: <TrendingUp className="w-4 h-4" />, label: "Follow-up" },
  ];
  return (
    <div className="overflow-x-auto -mx-6 px-6 pb-2">
      <div className="flex items-center gap-1 min-w-max sm:justify-center">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center text-center w-20">
              <div className="w-12 h-12 rounded-full bg-paper/10 border-2 border-paper/20 flex items-center justify-center text-brand mb-2">
                {s.icon}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-paper/80 font-semibold">
                {s.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="w-3 h-0.5 bg-paper/15 mx-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformModule({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border-2 border-paper/15 bg-paper/5 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-brand/15 text-brand flex items-center justify-center">
        {icon}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "var(--text-sm)",
          letterSpacing: "0.005em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Premium feature block (cinematic per-feature presentation) ──

function FeatureBlock({
  badge,
  title,
  highlight,
  body,
  bullets,
  metric,
  visual,
  reverse,
}: {
  badge: string;
  title: string;
  highlight: string;
  body: string;
  bullets: string[];
  metric: { value: string; label: string };
  visual: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
      <div className={reverse ? "order-1 lg:order-2" : ""}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper/10 border border-paper/15 text-paper/80 text-xs uppercase tracking-wider mb-5 font-bold">
          <Zap className="w-3 h-3 text-brand" />
          {badge}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: "clamp(28px, 4vw, 48px)",
            lineHeight: 1,
            letterSpacing: "0.005em",
          }}
        >
          {title}{" "}
          <span className="text-brand">{highlight}</span>
        </h3>
        <p className="text-base sm:text-lg text-paper/75 mt-5 leading-relaxed">
          {body}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-brand shrink-0" strokeWidth={3} />
              <span className="font-semibold text-paper">{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-paper/10 border border-paper/15">
          <TrendingUp className="w-4 h-4 text-brand" />
          <div>
            <span
              className="text-paper"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "var(--text-lg)",
              }}
            >
              {metric.value}
            </span>
            <span className="text-paper/70 text-xs uppercase tracking-wider ml-2 font-semibold">
              {metric.label}
            </span>
          </div>
        </div>
      </div>
      <div className={reverse ? "order-2 lg:order-1" : ""}>{visual}</div>
    </div>
  );
}

function BeforeAfterVisual() {
  return (
    <div className="rounded-xl border-2 border-ink shadow-[8px_8px_0_var(--brand)] overflow-hidden bg-ink">
      <div className="grid grid-cols-1">
        {/* BEFORE — real property photo. Drop the file at
            /public/landing-preview/before.jpg to populate. */}
        <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
          <Image
            src="/landing-preview/before.jpg"
            alt="Property before fence install"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink/80 text-paper text-xs uppercase tracking-wider font-bold backdrop-blur">
            Before
          </div>
        </div>
        <div className="h-px bg-brand" />
        {/* AFTER — placeholder until the rendered photo is dropped in
            at /public/landing-preview/after.jpg */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-ink via-ink-deep to-brand-dark flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-brand/40" />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand text-ink text-xs uppercase tracking-wider font-bold">
            After
          </div>
        </div>
      </div>
      <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider opacity-60">Style</div>
        <div className="flex gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-paper/10 border border-paper/20 text-[10px] uppercase tracking-wider">
            Aluminum
          </span>
          <span className="px-2 py-0.5 rounded-full bg-brand text-ink text-[10px] uppercase tracking-wider font-bold">
            Wood ✓
          </span>
          <span className="px-2 py-0.5 rounded-full bg-paper/10 border border-paper/20 text-[10px] uppercase tracking-wider">
            PVC
          </span>
        </div>
      </div>
    </div>
  );
}

function PermitIntelVisual() {
  return (
    <div className="rounded-xl bg-white border-2 border-ink shadow-[8px_8px_0_var(--brand)] overflow-hidden">
      <div className="bg-ink text-paper px-4 py-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand" />
        <div className="font-mono text-xs">
          4502 SW 92nd Ave, Miami, FL 33165
        </div>
      </div>
      <div className="p-4 space-y-2.5 text-sm">
        <PermitVisualRow label="Jurisdiction" value="Unincorporated MDC" tone="ok" />
        <PermitVisualRow label="Permit category" value="18 · Building" tone="warn" />
        <PermitVisualRow label="Wind-load zone" value="HVHZ — V_ult 175 mph" tone="ok" />
        <PermitVisualRow label="Max height — front" value="4 ft" tone="ok" />
        <PermitVisualRow label="Max height — rear / side" value="6 ft" tone="ok" />
        <PermitVisualRow label="HOA likelihood" value="Low" tone="ok" />
      </div>
      <div className="bg-paper border-t border-line p-4">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
          Required documents (4)
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase tracking-wider">
            Auto-filled
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase tracking-wider">
            Auto-filled
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase tracking-wider">
            Auto-filled
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold uppercase tracking-wider">
            Conditional
          </span>
        </div>
      </div>
    </div>
  );
}

function PermitVisualRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </div>
      <div
        className={`text-sm font-medium ${tone === "warn" ? "text-amber-700" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

function AccountabilityVisual() {
  return (
    <div className="rounded-xl bg-white border-2 border-ink shadow-[8px_8px_0_var(--brand)] overflow-hidden">
      <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-brand" />
          <span className="text-xs uppercase tracking-wider font-bold">
            Crew accountability list
          </span>
        </div>
        <span className="text-[10px] text-paper/70 font-mono">
          EST-1042
        </span>
      </div>
      <div className="p-4 text-sm">
        <AccItem label="Gates" value="1× swing-walk · facing in" />
        <AccItem label="Slope" value="2 ft drop NE corner" />
        <AccItem label="Posts" value="23 × 4×4 cedar · 30in concrete" />
        <AccItem label="Spacing" value="8 ft · 2 corners" />
        <AccItem label="Materials" value="184 LF cedar · 1 single gate kit" />
        <AccItem label="Site notes" value="Pool gate latch ≥ 54in" />
      </div>
      <div className="bg-paper border-t border-line p-4 flex items-center gap-2">
        <Check className="w-4 h-4 text-brand" strokeWidth={3} />
        <span className="text-xs text-slate-700 font-semibold">
          Crew has the full scope before they leave the yard.
        </span>
      </div>
    </div>
  );
}

function AccItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-line last:border-b-0">
      <div className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-slate-500 font-semibold pt-0.5">
        {label}
      </div>
      <div className="text-sm text-ink font-medium">{value}</div>
    </div>
  );
}

function ProductionVisual() {
  return (
    <div className="rounded-xl bg-white border-2 border-ink shadow-[8px_8px_0_var(--brand)] overflow-hidden">
      <div className="bg-ink text-paper px-4 py-3 flex items-center gap-2">
        <Workflow className="w-4 h-4 text-brand" />
        <span className="text-xs uppercase tracking-wider font-bold">
          Production board · This week
        </span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-line text-xs">
        {[
          { day: "Mon", crew: "A", job: "Sanchez", status: "scheduled" },
          { day: "Tue", crew: "A", job: "Sanchez", status: "in-progress" },
          { day: "Wed", crew: "B", job: "Rivera", status: "in-progress" },
          { day: "Thu", crew: "A", job: "Pinecrest", status: "scheduled" },
          { day: "Fri", crew: "B", job: "Coral Way", status: "scheduled" },
          { day: "Sat", crew: "A", job: "Open", status: "open" },
        ].map((cell) => (
          <div key={cell.day} className="bg-white p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              {cell.day} · Crew {cell.crew}
            </div>
            <div className="text-sm font-bold text-ink mt-1">
              {cell.job}
            </div>
            <div
              className={`mt-1 inline-block px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold ${
                cell.status === "in-progress"
                  ? "bg-emerald-100 text-emerald-700"
                  : cell.status === "scheduled"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {cell.status}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-paper border-t border-line p-4 flex items-center gap-3">
        <Workflow className="w-4 h-4 text-brand" />
        <div className="text-xs text-slate-700">
          <span className="font-bold text-ink">Office + crew</span> see
          schedule, status, materials in real time.
        </div>
      </div>
    </div>
  );
}

// ── Pricing tier ─────────────────────────────────────────────────

function PricingTier({
  name,
  price,
  priceUnit,
  tagline,
  features,
  cta,
  ctaHref,
  featured,
}: {
  name: string;
  price: string;
  priceUnit?: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-7 flex flex-col ${
        featured
          ? "border-brand bg-paper/[0.06] text-paper shadow-[6px_6px_0_var(--brand)] backdrop-blur"
          : "border-paper/15 bg-paper/[0.03] text-paper hover:border-paper/30 transition-colors"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            textTransform: "uppercase",
            fontSize: "var(--text-lg)",
            color: featured ? "var(--brand)" : "var(--paper)",
          }}
        >
          {name}
        </div>
        {featured && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink bg-brand px-2 py-0.5 rounded-full">
            Most popular
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "var(--text-3xl)",
            lineHeight: 1,
          }}
        >
          {price}
        </span>
        {priceUnit && (
          <span className="text-sm text-paper/50">{priceUnit}</span>
        )}
      </div>
      <p className="text-sm mb-6 text-paper/70">{tagline}</p>
      <ul className="space-y-2 text-sm mb-8 grow">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-brand mt-0.5 shrink-0">✓</span>
            <span className="text-paper/85">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-bold uppercase tracking-wide transition-colors ${
          featured
            ? "bg-brand text-ink hover:bg-paper"
            : "bg-paper text-ink hover:bg-brand"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider font-bold mb-3 opacity-80">
        {title}
      </div>
      <ul className="space-y-1.5 text-xs">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="opacity-70 hover:opacity-100 hover:text-brand"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
