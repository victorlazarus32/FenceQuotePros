import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Calculator,
  Check,
  FileSignature,
  FileText,
  Hammer,
  ImageIcon,
  Languages,
  MapPin,
  PenLine,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PhoneMockup } from "@/components/PhoneMockup";

export const metadata = {
  title: "Fence Quote Pros — Built exclusively for fence contractors",
  description:
    "Estimate faster. Prevent code issues. Win more jobs. The estimating platform built by fence contractors, for fence contractors.",
};

export default function LandingPage() {
  return (
    <div className="-mx-4 -my-8">
      {/* HERO */}
      <section className="relative bg-ink text-paper overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-paper/20 text-xs uppercase tracking-wider mb-6 font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand" />
              Built by fence contractors, for fence contractors
            </div>
            <h1
              className="text-paper"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(40px, 6.5vw, 80px)",
                lineHeight: 0.95,
                letterSpacing: "0.005em",
              }}
            >
              Built exclusively
              <br />
              for{" "}
              <span className="text-brand">fence contractors.</span>
            </h1>
            <p className="text-lg sm:text-xl mt-6 max-w-xl opacity-90 leading-relaxed font-medium">
              Estimate faster. Prevent code issues. Win more jobs.
            </p>
            <p className="text-sm sm:text-base mt-3 max-w-xl opacity-75 leading-relaxed">
              Fence Quote Pros combines estimating, compliance, and operations
              into one platform built from real-world fence experience.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-brand text-white font-bold uppercase tracking-wide hover:bg-white hover:text-ink transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/estimates/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border-2 border-paper/40 text-paper font-bold uppercase tracking-wide hover:bg-paper hover:text-ink transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <PlayCircle className="w-5 h-5" />
                Watch demo
              </Link>
            </div>
            <div className="mt-6 text-xs uppercase tracking-wider opacity-60">
              No credit card · 1-minute setup · Cancel anytime
            </div>

            <div className="mt-8 inline-flex items-start gap-3 px-4 py-3 rounded-md bg-paper/10 border border-paper/20 max-w-md">
              <Bell className="w-5 h-5 text-brand mt-0.5 shrink-0" />
              <div className="text-sm leading-relaxed">
                <span className="font-bold uppercase tracking-wide text-brand text-xs">
                  Read receipts
                </span>
                <div className="opacity-90 mt-0.5">
                  Know exactly when homeowners engage. Get a text or email the
                  moment they open your estimate.
                </div>
              </div>
            </div>
          </div>

          {/* Hero visual — phone showing the estimate wizard mid-build */}
          <div className="relative flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="bg-paper border-y-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Diff title="Pool-code" body="Miami-Dade FBC R4501 checks built-in" />
          <Diff title="Permit packets" body="Addendum + affidavits auto-filled" />
          <Diff title="Bilingual" body="Quote in English or Spanish, one click" />
          <Diff title="On-the-spot" body="Customer signs from your phone" />
        </div>
      </section>

      {/* WOW FEATURE — AI Compliance Engine */}
      <section className="relative bg-gradient-to-br from-ink via-ink-deep to-ink text-paper overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand text-ink text-xs uppercase tracking-wider mb-5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                The headline feature
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontSize: "clamp(32px, 5vw, 56px)",
                  lineHeight: 0.95,
                  letterSpacing: "0.005em",
                }}
              >
                AI Fence
                <br />
                <span className="text-brand">Compliance Engine.</span>
              </h2>
              <p className="text-lg mt-5 opacity-90 leading-relaxed">
                Catch the violation before the inspector does. Every estimate is
                scanned against pool code, gate hardware, post spacing,
                setbacks, and municipal permit rules — automatically.
              </p>
              <p className="text-sm mt-4 opacity-70 leading-relaxed">
                No other estimating tool does this. Because no other tool was
                built by people who've sat in front of an inspector with a
                rejected job.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCheck
                label="Pool-code violations"
                body="Height under 4', missing self-closing latch, climbable rails."
              />
              <ComplianceCheck
                label="Setback conflicts"
                body="Front-yard 4' max, side / rear setbacks per municipality — flagged before send."
              />
              <ComplianceCheck
                label="Gate & latch issues"
                body={`Gate swings inward toward pool? Latch height under 54"? Caught.`}
              />
              <ComplianceCheck
                label="Spacing problems"
                body="Wood §2328 height bracket changes max post spacing — auto-checked."
              />
              <ComplianceCheck
                label="Permit concerns"
                body="Folio-aware setbacks, height max by yard placement, HOA flags."
              />
              <ComplianceCheck
                label="Municipality rules"
                body="Coral Gables, Miami Beach, Doral, Hialeah — code is built in."
              />
            </div>
          </div>
        </div>
      </section>

      {/* WOW FEATURE — AI Fence Visualization */}
      <section className="bg-paper border-y-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink text-paper text-xs uppercase tracking-wider mb-5 font-bold">
                <ImageIcon className="w-3.5 h-3.5" />
                Premium Vision AI
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontSize: "clamp(32px, 5vw, 56px)",
                  lineHeight: 0.95,
                  letterSpacing: "0.005em",
                }}
              >
                See the fence{" "}
                <span className="text-brand">before it's built.</span>
              </h2>
              <p className="text-lg mt-5 text-slate-700 leading-relaxed">
                Snap a photo of the property. Pick a style. Watch the fence
                render onto the real backyard — black aluminum, white PVC,
                horizontal modern, ranch rail. Homeowners stop guessing and
                start signing.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <ContractorPoint>Property photo overlays</ContractorPoint>
                <ContractorPoint>Side-by-side upgrades</ContractorPoint>
                <ContractorPoint>Style + color swaps</ContractorPoint>
                <ContractorPoint>Before / after preview</ContractorPoint>
                <ContractorPoint>Higher close rates</ContractorPoint>
                <ContractorPoint>Bigger ticket size</ContractorPoint>
              </ul>
              <div className="mt-6 text-sm font-semibold text-ink">
                "See what black aluminum would look like." → Sold.
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg bg-gradient-to-br from-ink via-ink-deep to-brand-dark border-4 border-ink shadow-[8px_8px_0_var(--brand)] overflow-hidden flex items-center justify-center p-8">
                <div className="text-center text-paper">
                  <ImageIcon className="w-20 h-20 text-brand mx-auto mb-4 opacity-90" />
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      fontSize: "var(--text-xl)",
                      letterSpacing: "0.005em",
                    }}
                  >
                    AI render preview
                  </div>
                  <div className="text-xs uppercase tracking-wider opacity-70 mt-2">
                    Property photo + selected style
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider">
                    <div className="bg-paper/10 border border-paper/20 rounded py-2">Black Aluminum</div>
                    <div className="bg-brand text-ink rounded py-2 font-bold">White PVC ✓</div>
                    <div className="bg-paper/10 border border-paper/20 rounded py-2">Horizontal Wood</div>
                    <div className="bg-paper/10 border border-paper/20 rounded py-2">Ranch Rail</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES — top tier (visually weighted) */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-2">
              The core three
            </div>
            <h2 className="h-page" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>
              The math, the code, the paperwork.
              <br />
              <span className="text-slate-500">Solved.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <BigFeature
              icon={<Calculator className="w-7 h-7" />}
              title="Fence calculator"
              outcome="Estimate any fence configuration in 90 seconds."
              body="Linear feet, height, post spacing, gates, motors, custom add-ons. Real production logic — concrete quantities, waste factors, labor speeds by material type."
            />
            <BigFeature
              icon={<ShieldCheck className="w-7 h-7" />}
              title="Pool-code compliance"
              outcome="Stop failing pool inspections."
              body="Florida pool barriers must be ≥4'. Self-closing latches, climbability, gate-swing direction — flagged before you send the quote."
              accent
            />
            <BigFeature
              icon={<FileSignature className="w-7 h-7" />}
              title="Permit packets"
              outcome="From estimate to filed permit in one flow."
              body="MDC fence addendum, building permit application, finished-side + height affidavits — auto-filled from the estimate, signed by both parties, ready for the courthouse."
            />
          </div>
        </div>
      </section>

      {/* SECONDARY FEATURES */}
      <section className="bg-paper border-t-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-2">
              Plus everything else you need
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "clamp(24px, 3vw, 36px)",
              }}
            >
              From driveway to deposit.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature
              icon={<Languages className="w-5 h-5" />}
              title="Bilingual estimates"
              body="Hand the same quote to a homeowner in English or Spanish. One click."
            />
            <Feature
              icon={<PenLine className="w-5 h-5" />}
              title="Sign on the spot"
              body="Close the deal before you leave the driveway. Signature + accept on the estimate itself."
            />
            <Feature
              icon={<Bell className="w-5 h-5" />}
              title="Open alerts"
              body="Know exactly when homeowners engage. Text or email the moment they open the quote."
            />
            <Feature
              icon={<FileText className="w-5 h-5" />}
              title="Invoices & payments"
              body="Estimate to invoice in one click. Track partial payments, send reminders."
            />
            <Feature
              icon={<Hammer className="w-5 h-5" />}
              title="Smart fence templates"
              body="Wood, vinyl, aluminum, chain link, ranch rail — prebuilt with materials, labor, and markup."
            />
            <Feature
              icon={<MapPin className="w-5 h-5" />}
              title="Municipality intelligence"
              body="Drop the address. Get max height, setbacks, zoning, and HOA likelihood instantly."
            />
            <Feature
              icon={<FileSignature className="w-5 h-5" />}
              title="Permit autofill"
              body="Permit-ready packets generated from the estimate. Folio, owner data, code references — pre-filled."
            />
            <Feature
              icon={<ImageIcon className="w-5 h-5" />}
              title="AI fence visualization"
              body="Render the fence onto a property photo before the homeowner commits. Vision AI tier."
            />
          </div>
        </div>
      </section>

      {/* BUILT BY CONTRACTORS */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-center">
            <div className="order-2 md:order-1">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-brand-soft to-paper border-2 border-line flex items-center justify-center">
                <Hammer className="w-24 h-24 text-brand opacity-80" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-xs uppercase tracking-wider text-brand font-bold mb-3">
                The moat
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontSize: "clamp(30px, 4.5vw, 50px)",
                  lineHeight: 1,
                  letterSpacing: "0.005em",
                }}
              >
                Built from <span className="text-brand">20+ years</span> of real
                fence contracting.
              </h2>
              <p className="text-base mt-5 text-slate-700 leading-relaxed">
                This isn't a generic invoicing app with a fence skin. It's
                estimating logic, permit packets, and code checks built by
                people who've actually pulled fence permits, set posts, and
                argued with inspectors.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <ContractorPoint>Estimating</ContractorPoint>
                <ContractorPoint>Permitting</ContractorPoint>
                <ContractorPoint>Inspections</ContractorPoint>
                <ContractorPoint>Production</ContractorPoint>
                <ContractorPoint>Field operations</ContractorPoint>
                <ContractorPoint>Code compliance</ContractorPoint>
              </ul>
              <div className="mt-6 text-xs text-slate-500 leading-relaxed">
                Powered by the team behind <strong className="text-ink">Permit Solutions</strong> and{" "}
                <strong className="text-ink">PermitLens</strong> — we live in
                AHJ portals every day.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-2">
              Where we're going
            </div>
            <h2 className="h-page text-paper" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>
              The fence contractor's <span className="text-brand">operating system.</span>
            </h2>
            <p className="text-sm mt-4 max-w-2xl mx-auto opacity-70">
              Estimating today. Operations, permits, materials, and a
              contractor network on the way.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Phase n="1" label="Estimating" status="now" />
            <Phase n="2" label="Operations" status="next" />
            <Phase n="3" label="Permit IQ" status="next" />
            <Phase n="4" label="Materials" status="later" />
            <Phase n="5" label="AI compliance" status="later" />
            <Phase n="6" label="Contractor network" status="later" />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-paper border-t-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-2">
              Pricing
            </div>
            <h2 className="h-page" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>
              Pick your tier. Scale when you're ready.
            </h2>
            <p className="text-sm text-slate-600 mt-3 max-w-2xl mx-auto">
              From your first quote to a fully automated fence operation. Most
              contractors land on Pro.
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
                "AI compliance engine",
                "Bilingual quotes",
                "Open alerts (text + email)",
                "Pick your plan when it ends",
              ]}
              cta="Start free trial"
              ctaHref="/login"
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
              ctaHref="/login"
            />
            <PricingTier
              name="Pro"
              price="$149"
              priceUnit="/ month"
              tagline="Fence business operations."
              features={[
                "Everything in Core",
                "AI compliance engine",
                "Municipality intelligence",
                "Permit packet auto-generation",
                "Pool-code detection",
                "Setback + zoning checks",
                "Crew management",
                "Profitability tracking",
              ]}
              cta="Start Pro"
              ctaHref="/login"
              featured
            />
            <PricingTier
              name="Vision AI"
              price="$299"
              priceUnit="/ month"
              tagline="Render fences onto real properties."
              features={[
                "Everything in Pro",
                "AI fence visualization",
                "Property photo rendering",
                "Style + color overlays",
                "Upgrade comparisons",
                "Premium presentation tools",
                "Priority render queue",
              ]}
              cta="Start Vision AI"
              ctaHref="/login"
            />
          </div>

          <div className="mt-10 max-w-4xl mx-auto rounded-md bg-white border-2 border-line p-5 text-center">
            <div className="text-xs uppercase tracking-wider text-brand font-bold mb-1">
              Add-ons
            </div>
            <div className="text-sm text-slate-700">
              <span className="font-semibold text-ink">$19 permit-ready packet</span> per job ·{" "}
              <span className="font-semibold text-ink">$49/mo permit automation</span> ·
              additional Vision AI render credits
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 mt-6">
            No setup fees. Cancel anytime. 14-day free trial — no card required.
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-brand text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 0.95,
            }}
          >
            Stop quoting on napkins.
          </h2>
          <p className="text-lg mt-5 max-w-2xl mx-auto opacity-90">
            Estimate faster. Prevent code issues. Win more jobs. Set up in a
            minute.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-ink text-paper font-bold uppercase tracking-wide hover:bg-white hover:text-ink transition-colors text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
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
            <div className="text-xs opacity-60">
              Built in Miami for fence contractors everywhere.
            </div>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Features", "/landing#features"],
              ["Pricing", "/landing#pricing"],
              ["Embed widget", "/embed/alldayfence-quote.html"],
            ]}
          />
          <FooterCol
            title="Use cases"
            links={[
              ["Wood privacy", "#"],
              ["Aluminum / pool", "#"],
              ["Chain link / commercial", "#"],
              ["Vinyl & PVC", "#"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["About", "#"],
              ["Contact", "#"],
              ["Privacy", "#"],
              ["Terms", "#"],
            ]}
          />
        </div>
        <div className="border-t border-paper/10">
          <div className="max-w-6xl mx-auto px-6 py-4 text-xs opacity-60">
            © {new Date().getFullYear()} Fence Quote Pros. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Diff({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div
        className="text-brand"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "var(--text-xl)",
          lineHeight: 1,
        }}
      >
        {title}
      </div>
      <div className="text-xs sm:text-sm text-slate-700 mt-1.5">{body}</div>
    </div>
  );
}

function ComplianceCheck({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-md bg-paper/5 border border-paper/10 hover:bg-paper/10 transition-colors">
      <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
        <Check className="w-4 h-4 text-brand" strokeWidth={3} />
      </div>
      <div>
        <div
          className="text-brand"
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
        <div className="text-xs opacity-80 mt-1 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

function BigFeature({
  icon,
  title,
  outcome,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  outcome: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-7 flex flex-col h-full transition-colors ${
        accent
          ? "bg-ink text-paper border-2 border-ink shadow-[6px_6px_0_var(--brand)]"
          : "bg-paper border-2 border-line hover:border-ink"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-md flex items-center justify-center mb-4 ${
          accent ? "bg-brand text-ink" : "bg-brand-soft text-brand"
        }`}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "var(--text-lg)",
          letterSpacing: "0.005em",
        }}
      >
        {title}
      </div>
      <p
        className={`text-sm font-semibold mt-2 ${
          accent ? "text-brand" : "text-ink"
        }`}
      >
        {outcome}
      </p>
      <p className={`text-sm mt-2 leading-relaxed ${accent ? "opacity-80" : "text-slate-700"}`}>
        {body}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  soon,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  soon?: boolean;
}) {
  return (
    <div className="bg-white rounded-md border-2 border-line p-5 hover:border-ink transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-brand">{icon}</span>}
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
        </div>
        {soon && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-soft px-2 py-0.5 rounded-full">
            Soon
          </span>
        )}
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{body}</p>
    </div>
  );
}

function ContractorPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="w-4 h-4 text-brand shrink-0" strokeWidth={3} />
      <span className="font-semibold text-ink">{children}</span>
    </li>
  );
}

function Phase({
  n,
  label,
  status,
}: {
  n: string;
  label: string;
  status: "now" | "next" | "later";
}) {
  const styles = {
    now: "bg-brand text-ink border-brand",
    next: "bg-paper/10 text-paper border-paper/30",
    later: "bg-transparent text-paper/60 border-paper/15",
  };
  const badge = {
    now: "Live",
    next: "Next",
    later: "Later",
  };
  return (
    <div
      className={`rounded-md border-2 p-4 flex flex-col items-start gap-2 ${styles[status]}`}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className="opacity-70"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "var(--text-sm)",
          }}
        >
          {n}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-bold">
          {badge[status]}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "var(--text-md)",
          letterSpacing: "0.005em",
          lineHeight: 1.05,
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
      className={`rounded-lg border-2 p-8 flex flex-col ${
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
            fontSize: "var(--text-xl)",
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
      <p
        className={`text-sm mb-6 ${featured ? "opacity-80" : "text-slate-600"}`}
      >
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
            <Link href={href} className="opacity-70 hover:opacity-100 hover:text-brand">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
