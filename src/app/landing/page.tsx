import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  FileSignature,
  FileText,
  Hammer,
  Image as ImageIcon,
  Languages,
  Layers,
  MapPin,
  Package,
  PenLine,
  PhoneCall,
  Ruler,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export const metadata = {
  title: "Fence Quote Pros — The AI Operating System for Fence Contractors",
  description:
    "Capture leads, generate smart quotes, visualize fences, automate permits, and manage every project from one platform. Built by fence contractors.",
};

export default function LandingPage() {
  return (
    <div className="-mx-4 -my-8 bg-paper">
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section
        id="product"
        className="relative bg-paper border-b border-line overflow-hidden"
      >
        <div className="absolute inset-0 -z-0 opacity-[0.04] pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-ink blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 grid lg:grid-cols-[1.05fr_1.2fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink/5 border border-ink/10 text-xs uppercase tracking-wider mb-6 font-semibold text-ink">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Built by fence contractors · For fence contractors
            </div>
            <h1
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(40px, 5.5vw, 76px)",
                lineHeight: 0.95,
                letterSpacing: "0.005em",
              }}
            >
              The <span className="text-brand">AI operating system</span> for
              fence contractors.
            </h1>
            <p className="text-lg sm:text-xl mt-6 max-w-xl text-slate-700 leading-relaxed">
              Capture leads, generate smart quotes, visualize fences, automate
              permits, and manage every project from one platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-ink text-paper font-bold uppercase tracking-wide hover:bg-brand hover:text-ink transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Book a demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-brand text-white font-bold uppercase tracking-wide hover:bg-ink transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Start free trial
              </Link>
            </div>
            <div className="mt-6 text-xs uppercase tracking-wider text-slate-500">
              14-day free trial · No card required
            </div>

            <div className="mt-10 pt-6 border-t border-line grid grid-cols-3 gap-6 max-w-md">
              <Stat label="Lead → quote" value="< 5 min" />
              <Stat label="Permit packet" value="One click" />
              <Stat label="Built for FL" value="305 / 786" />
            </div>
          </div>

          {/* HERO DASHBOARD MOCKUP */}
          <HeroDashboard />
        </div>
      </section>

      {/* ─── PROBLEM ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              The status quo
            </div>
            <h2
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: 1.05,
              }}
            >
              Fence contractors are still losing time to manual estimates,
              phone calls, and permit confusion.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProblemCard
              icon={<Truck className="w-5 h-5" />}
              title="Wasted site visits"
              body="Driving to a property to confirm a measurement that should've been captured at lead intake."
            />
            <ProblemCard
              icon={<Clock className="w-5 h-5" />}
              title="Slow follow-ups"
              body="Estimates that take three days to produce. Customers go with whoever responded that night."
            />
            <ProblemCard
              icon={<DollarSign className="w-5 h-5" />}
              title="Inconsistent pricing"
              body="Three different reps quoting the same fence at three different prices. Margin leaks every job."
            />
            <ProblemCard
              icon={<Ruler className="w-5 h-5" />}
              title="Manual measurements"
              body="Tape measures, pencils on the back of an envelope, retyping numbers into a Word doc."
            />
            <ProblemCard
              icon={<FileText className="w-5 h-5" />}
              title="Permit uncertainty"
              body="Is this address Coral Gables or Unincorporated MDC? Which addendum is required? Nobody knows."
            />
            <ProblemCard
              icon={<Bell className="w-5 h-5" />}
              title="Missed leads"
              body="Web form submissions that sat in a spam folder for a week. The job's already booked elsewhere."
            />
          </div>
        </div>
      </section>

      {/* ─── AI VISUALIZATION ───────────────────────────────────── */}
      <section
        id="visualization"
        className="bg-paper border-b border-line"
      >
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              Visualization
            </div>
            <h2
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.2vw, 52px)",
                lineHeight: 1.05,
              }}
            >
              Show homeowners their fence{" "}
              <span className="text-brand">before installation.</span>
            </h2>
            <p className="text-lg text-slate-700 mt-5">
              Upload a property photo. Pick a style. The system overlays the
              fence onto the real backyard. Quote updates in real time.
              Homeowners stop guessing and start signing.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
            {/* Workflow steps */}
            <div className="space-y-3">
              <WorkflowStep
                step="1"
                title="Homeowner uploads property photo"
                body="Front yard, side yard, back fence line — any angle works."
              />
              <WorkflowStep
                step="2"
                title="Contractor selects fence style"
                body="6 ft wood privacy, 4 ft aluminum picket, chain link, ranch rail, modern horizontal — full catalog."
              />
              <WorkflowStep
                step="3"
                title="System overlays fence concept"
                body="The fence renders onto the actual property in seconds. Style, height, color all swappable."
              />
              <WorkflowStep
                step="4"
                title="Quote updates in real time"
                body="Linear footage, materials, labor, permits — live. Hand the homeowner a finalized number on the spot."
              />
            </div>

            {/* Before/After comparison card */}
            <BeforeAfterCard />
          </div>
        </div>
      </section>

      {/* ─── PERMIT INTELLIGENCE ────────────────────────────────── */}
      <section id="permits" className="bg-ink text-paper border-b border-ink">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              Permit intelligence
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.2vw, 52px)",
                lineHeight: 1.05,
              }}
            >
              Built by contractors who{" "}
              <span className="text-brand">understand permits.</span>
            </h2>
            <p className="text-lg opacity-80 mt-5">
              Drop in the address. The system identifies the jurisdiction,
              tells you which permit is required, generates the documents, and
              flags the gotchas before you submit.
            </p>
          </div>

          <PermitIntelligenceMockup />
        </div>
      </section>

      {/* ─── WORKFLOW AUTOMATION ────────────────────────────────── */}
      <section className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              End-to-end workflow
            </div>
            <h2
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.2vw, 52px)",
                lineHeight: 1.05,
              }}
            >
              From quote to permit to install —{" "}
              <span className="text-brand">one connected workflow.</span>
            </h2>
          </div>

          <WorkflowPipeline />
        </div>
      </section>

      {/* ─── ROI METRICS ────────────────────────────────────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              The business case
            </div>
            <h2
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.2vw, 52px)",
                lineHeight: 1.05,
              }}
            >
              Turn more leads into{" "}
              <span className="text-brand">profitable fence jobs.</span>
            </h2>
            <p className="text-lg text-slate-700 mt-5">
              Every minute spent retyping, driving, or chasing paper is margin
              the homeowner doesn't see and you don't get to keep.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              metric="< 5 min"
              label="Quote response time"
              body="From new lead to a finished, signed-ready estimate."
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              metric="2–3×"
              label="Higher close rates"
              body="Fence visualization on-site shortens the decision."
              accent
            />
            <MetricCard
              icon={<Truck className="w-5 h-5" />}
              metric="Fewer"
              label="Wasted site visits"
              body="Quote and visualize before the truck rolls."
            />
            <MetricCard
              icon={<DollarSign className="w-5 h-5" />}
              metric="Consistent"
              label="Pricing across reps"
              body="Same calculator, same margin, same answer every time."
            />
            <MetricCard
              icon={<FileText className="w-5 h-5" />}
              metric="Hours"
              label="Reduced admin time"
              body="Permit packets, follow-ups, invoicing — automated."
            />
            <MetricCard
              icon={<Bell className="w-5 h-5" />}
              metric="Zero"
              label="Lost leads"
              body="Auto follow-ups + read receipts on every estimate."
            />
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              Pricing
            </div>
            <h2
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: 1.05,
              }}
            >
              Pick your tier. Scale when you're ready.
            </h2>
            <p className="text-base text-slate-600 mt-4">
              Most contractors land on Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PricingTier
              name="Free Trial"
              price="$0"
              priceUnit="/ 14 days"
              tagline="Full Pro access. No card required."
              features={[
                "Every Pro feature unlocked",
                "Unlimited estimates for 14 days",
                "Compliance engine",
                "Bilingual quotes",
                "Open alerts (text + email)",
                "Pick your plan when it ends",
              ]}
              cta="Start free trial"
              ctaHref="/signup"
            />
            <PricingTier
              name="Core"
              price="$49"
              priceUnit="/ month"
              tagline="Professional fence estimating."
              features={[
                "Unlimited estimates & invoices",
                "Bilingual quotes (EN / ES)",
                "E-signatures",
                "Open alerts (text + email)",
                "Customer management",
                "Estimate templates",
                "Stripe payments",
              ]}
              cta="Start Core"
              ctaHref="/signup"
            />
            <PricingTier
              name="Pro"
              price="$149"
              priceUnit="/ month"
              tagline="Fence business operations."
              features={[
                "Everything in Core",
                "Compliance engine",
                "Permit intelligence",
                "Permit autofill",
                "Wind-load checks",
                "Pool-code detection",
                "Crew management",
                "Profitability tracking",
              ]}
              cta="Start Pro"
              ctaHref="/signup"
              featured
            />
            <PricingTier
              name="Visualizer"
              price="$299"
              priceUnit="/ month"
              tagline="Render fences onto real properties."
              features={[
                "Everything in Pro",
                "Fence visualization",
                "Property photo rendering",
                "Style + color overlays",
                "Upgrade comparisons",
                "Premium presentation tools",
                "Priority render queue",
              ]}
              cta="Start Visualizer"
              ctaHref="/signup"
            />
          </div>

          <div className="mt-8 max-w-4xl mx-auto rounded-md bg-paper border-2 border-line p-5 text-center">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-1">
              Add-ons
            </div>
            <div className="text-sm text-slate-700">
              <span className="font-semibold text-ink">$19 permit-ready packet</span>{" "}
              per job ·{" "}
              <span className="font-semibold text-ink">$49/mo permit automation</span>{" "}
              · additional Visualizer render credits
            </div>
          </div>
          <div className="text-center text-xs text-slate-500 mt-6">
            No setup fees · Cancel anytime · 14-day free trial — no card required
          </div>
        </div>
      </section>

      {/* ─── PLATFORM / FUTURE MODULES ──────────────────────────── */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
              The platform
            </div>
            <h2
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(30px, 4.2vw, 52px)",
                lineHeight: 1.05,
              }}
            >
              Built for fencing today.{" "}
              <span className="text-brand">Designed for contractor growth tomorrow.</span>
            </h2>
            <p className="text-lg text-slate-700 mt-5">
              Eight modules on the roadmap. Estimating + visualization +
              permits ship today. The rest of the operating system follows.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <ModuleTile icon={<Users className="w-5 h-5" />} label="CRM" status="next" />
            <ModuleTile icon={<Calendar className="w-5 h-5" />} label="Scheduling" status="next" />
            <ModuleTile icon={<Wrench className="w-5 h-5" />} label="Crew management" status="next" />
            <ModuleTile icon={<CreditCard className="w-5 h-5" />} label="Payments" status="now" />
            <ModuleTile icon={<Wallet className="w-5 h-5" />} label="Financing" status="later" />
            <ModuleTile icon={<Package className="w-5 h-5" />} label="Materials" status="later" />
            <ModuleTile icon={<FileSignature className="w-5 h-5" />} label="Permits" status="now" />
            <ModuleTile icon={<BarChart3 className="w-5 h-5" />} label="Analytics" status="later" />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────── */}
      <section className="bg-ink text-paper">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "clamp(36px, 5.5vw, 72px)",
              lineHeight: 0.95,
            }}
          >
            Give your fence business{" "}
            <span className="text-brand">the operating system it deserves.</span>
          </h2>
          <p className="text-lg sm:text-xl mt-6 opacity-80 max-w-2xl mx-auto leading-relaxed">
            Stop quoting on napkins. Stop chasing permits. Start running the
            fence business you always pictured.
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
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md border-2 border-paper/30 text-paper font-bold uppercase tracking-wide hover:bg-paper hover:text-ink transition-colors text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-ink text-paper border-t border-paper/10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white rounded-md p-0.5">
                <Image
                  src="/logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-sm"
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  fontSize: 14,
                }}
              >
                Fence <span className="text-brand">Quote</span> Pros
              </span>
            </div>
            <div className="text-xs opacity-60 max-w-xs leading-relaxed">
              The AI operating system for fence contractors. Built in Miami,
              shipping to fence pros nationwide.
            </div>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Visualization", "/landing#visualization"],
              ["Permit Intel", "/landing#permits"],
              ["Pricing", "/landing#pricing"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["Book a demo", "/book-demo"],
              ["About", "#"],
              ["Contact", "mailto:victor@permitsolutions.us"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Privacy", "#"],
              ["Terms", "#"],
              ["Sign in", "/login"],
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

// ── Components ────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "var(--text-xl)",
          letterSpacing: "0.005em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
        {label}
      </div>
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      <div className="rounded-xl bg-white border border-line shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] overflow-hidden">
        {/* Browser-chrome top bar */}
        <div className="bg-paper border-b border-line px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex-1 text-center">
            <div className="inline-block px-3 py-0.5 rounded-md bg-white border border-line text-[10px] text-slate-500 font-mono">
              fencequotepros.com / estimates / EST-1042
            </div>
          </div>
        </div>

        {/* Estimate header */}
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Estimate
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
            New lead captured
          </div>
        </div>

        {/* Inner grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-paper">
          {/* Address detect */}
          <div className="bg-white rounded-lg border border-line p-3 col-span-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
              <MapPin className="w-3 h-3 text-brand" />
              Property address detected
            </div>
            <div className="text-sm font-medium text-ink">
              4502 SW 92nd Ave, Miami, FL 33165
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Folio 30-4029-001-0010 · Unincorporated MDC · R-1
            </div>
          </div>

          {/* Fence type */}
          <div className="bg-white rounded-lg border border-line p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <Hammer className="w-3 h-3 text-brand" />
              Fence type
            </div>
            <div className="text-sm font-bold text-ink">
              6 ft Wood Privacy
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Shadow-box · cedar · facing out
            </div>
          </div>

          {/* Linear footage */}
          <div className="bg-white rounded-lg border border-line p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <Ruler className="w-3 h-3 text-brand" />
              Linear footage
            </div>
            <div className="text-sm font-bold text-ink font-mono">
              184 LF
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              23 posts · 2 corners
            </div>
          </div>

          {/* Visualization preview */}
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
                {/* Suggestion of fence vertical bars */}
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

          {/* Permit status */}
          <div className="bg-white rounded-lg border border-line p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <ShieldCheck className="w-3 h-3 text-brand" />
              Permit
            </div>
            <div className="text-xs font-semibold text-amber-700">
              Required (4 docs)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              MDC §33-11
            </div>
          </div>

          {/* Quote total */}
          <div className="bg-ink rounded-lg p-3 text-paper">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60 font-semibold mb-2">
              <DollarSign className="w-3 h-3 text-brand" />
              Quote total
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
              50% deposit · $3,920 due
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-xl bg-paper border border-line p-5 hover:border-ink transition-colors">
      <div className="w-10 h-10 rounded-lg bg-white border border-line flex items-center justify-center text-slate-500 mb-3">
        {icon}
      </div>
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
        {title}
      </div>
      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}

function WorkflowStep({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-line p-5 flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded-full bg-brand text-ink flex items-center justify-center font-bold text-sm">
        {step}
      </div>
      <div>
        <div className="font-semibold text-ink text-sm">{title}</div>
        <div className="text-sm text-slate-600 mt-1 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

function BeforeAfterCard() {
  return (
    <div className="relative">
      <div className="rounded-xl border-2 border-ink shadow-[8px_8px_0_var(--brand)] overflow-hidden bg-ink">
        <div className="grid grid-cols-1">
          {/* BEFORE */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-paper/30" />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink/80 text-paper text-xs uppercase tracking-wider font-bold">
              Before
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <div className="text-paper/60 text-[10px] uppercase tracking-wider font-semibold">
                Property photo · No fence
              </div>
            </div>
          </div>
          <div className="h-px bg-brand" />
          {/* AFTER */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-ink via-ink-deep to-brand-dark flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-brand/40" />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand text-ink text-xs uppercase tracking-wider font-bold">
              After
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <div className="text-paper/60 text-[10px] uppercase tracking-wider font-semibold">
                Same property · 6 ft wood privacy rendered
              </div>
            </div>
          </div>
        </div>
        <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider opacity-60">
            Style
          </div>
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
    </div>
  );
}

function PermitIntelligenceMockup() {
  return (
    <div className="rounded-xl bg-paper text-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)] overflow-hidden border border-paper/20">
      {/* Address bar */}
      <div className="bg-white border-b border-line px-5 py-4 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-brand" />
        <div className="flex-1 font-mono text-sm text-ink">
          4502 SW 92nd Ave, Miami, FL 33165
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] uppercase tracking-wider font-bold text-emerald-700">
          <Check className="w-3 h-3" />
          Detected
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-px bg-line">
        {/* Left: jurisdiction details */}
        <div className="bg-paper p-6 space-y-4">
          <PermitRow
            label="Jurisdiction"
            value="Unincorporated Miami-Dade"
            tone="ok"
          />
          <PermitRow label="Zoning district" value="R-1 (Single family)" tone="ok" />
          <PermitRow
            label="Permit required"
            value="Yes — Building (Cat. 18)"
            tone="warn"
          />
          <PermitRow label="Max fence height" value="6 ft side / rear · 4 ft front" tone="ok" />
          <PermitRow label="Wind-load zone" value="HVHZ — V_ult 175 mph" tone="ok" />
          <PermitRow label="HOA likelihood" value="Low (no association on file)" tone="ok" />
        </div>

        {/* Right: required documents */}
        <div className="bg-paper p-6">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Required documents (4)
          </div>
          <div className="space-y-2">
            <DocItem name="MDC Building Permit Application" status="autofilled" />
            <DocItem name="Sec. 33-11 Fence Addendum" status="autofilled" />
            <DocItem name="Affidavit to Extend Height" status="conditional" />
            <DocItem name="Survey + property pin photos" status="upload" />
          </div>

          <div className="mt-5 pt-4 border-t border-line">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 uppercase tracking-wider font-semibold">
                Estimated approval
              </span>
              <span className="text-ink font-bold">5–7 business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PermitRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "block";
}) {
  const dot =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="flex items-start gap-3">
      <span className={`w-1.5 h-1.5 rounded-full mt-2 ${dot} shrink-0`} />
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </div>
        <div className="text-sm text-ink font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function DocItem({
  name,
  status,
}: {
  name: string;
  status: "autofilled" | "conditional" | "upload";
}) {
  const styles = {
    autofilled: {
      icon: <Check className="w-3 h-3" />,
      label: "Autofilled",
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    conditional: {
      icon: <Sparkles className="w-3 h-3" />,
      label: "Conditional",
      bg: "bg-amber-50 border-amber-200 text-amber-700",
    },
    upload: {
      icon: <ArrowRight className="w-3 h-3" />,
      label: "Upload",
      bg: "bg-slate-100 border-slate-200 text-slate-700",
    },
  } as const;
  const s = styles[status];
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-md bg-white border border-line">
      <span className="text-sm text-ink font-medium">{name}</span>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider font-bold ${s.bg}`}
      >
        {s.icon}
        {s.label}
      </span>
    </div>
  );
}

function WorkflowPipeline() {
  const steps = [
    { icon: <Bell className="w-5 h-5" />, label: "Lead" },
    { icon: <Ruler className="w-5 h-5" />, label: "Quote" },
    { icon: <ImageIcon className="w-5 h-5" />, label: "Visualization" },
    { icon: <FileSignature className="w-5 h-5" />, label: "Permit" },
    { icon: <Calendar className="w-5 h-5" />, label: "Schedule" },
    { icon: <Wrench className="w-5 h-5" />, label: "Install" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Payment" },
  ];
  return (
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center text-center relative">
            <div className="w-14 h-14 rounded-full bg-paper border-2 border-line flex items-center justify-center text-brand mb-3 relative z-10">
              {s.icon}
            </div>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-7 left-[58%] w-full h-0.5 bg-line" />
            )}
            <div
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "var(--text-sm)",
                letterSpacing: "0.005em",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  metric,
  label,
  body,
  accent,
}: {
  icon: React.ReactNode;
  metric: string;
  label: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-6 transition-colors ${
        accent
          ? "bg-ink text-paper border-2 border-ink shadow-[6px_6px_0_var(--brand)]"
          : "bg-white border border-line hover:border-ink"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
          accent ? "bg-brand text-ink" : "bg-brand-soft text-brand"
        }`}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "var(--text-3xl)",
          lineHeight: 1,
          color: accent ? "var(--brand)" : "var(--ink)",
        }}
      >
        {metric}
      </div>
      <div className="text-xs uppercase tracking-wider font-semibold mt-2">
        {label}
      </div>
      <div
        className={`text-sm mt-2 leading-relaxed ${accent ? "opacity-80" : "text-slate-600"}`}
      >
        {body}
      </div>
    </div>
  );
}

function ModuleTile({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  status: "now" | "next" | "later";
}) {
  const meta = {
    now: { ring: "border-brand bg-white", badge: "bg-brand text-ink", text: "Live" },
    next: { ring: "border-line bg-white", badge: "bg-ink/10 text-ink", text: "Next" },
    later: { ring: "border-line bg-paper", badge: "bg-slate-100 text-slate-500", text: "Later" },
  } as const;
  const s = meta[status];
  return (
    <div className={`rounded-xl border-2 p-5 ${s.ring}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
          {icon}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${s.badge}`}
        >
          {s.text}
        </span>
      </div>
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
        {label}
      </div>
    </div>
  );
}

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
          ? "border-ink bg-ink text-paper shadow-[6px_6px_0_var(--brand)]"
          : "border-line bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            textTransform: "uppercase",
            fontSize: "var(--text-lg)",
            color: featured ? "var(--brand)" : "var(--ink)",
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
          <span className={`text-sm ${featured ? "opacity-60" : "text-slate-500"}`}>
            {priceUnit}
          </span>
        )}
      </div>
      <p className={`text-sm mb-6 ${featured ? "opacity-80" : "text-slate-600"}`}>
        {tagline}
      </p>
      <ul className="space-y-2 text-sm mb-8 grow">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-brand mt-0.5 shrink-0">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-bold uppercase tracking-wide transition-colors ${
          featured
            ? "bg-brand text-ink hover:bg-paper"
            : "bg-ink text-paper hover:bg-brand hover:text-ink"
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
