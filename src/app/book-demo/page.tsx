import Link from "next/link";
import { ArrowRight, Calendar, Mail, Phone } from "lucide-react";

export const metadata = {
  title: "Book a demo — Fence Quote Pros",
};

export default function BookDemoPage() {
  return (
    <div className="-mx-4 -my-8 min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl border-2 border-line shadow-[6px_6px_0_var(--brand)] p-8 sm:p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs uppercase tracking-wider font-bold mb-6">
            <Calendar className="w-3.5 h-3.5" />
            Book a demo
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
            See the operating system in action.
          </h1>

          <p className="text-base text-slate-700 mt-4 leading-relaxed">
            30-minute walkthrough of estimating, fence visualization, permit
            packet generation, and the contractor dashboard. We'll tailor it
            to your typical job mix.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:victor@permitsolutions.us?subject=Fence%20Quote%20Pros%20Demo%20Request&body=Hi%20Victor%2C%0A%0AI%27d%20like%20to%20schedule%20a%20demo%20of%20Fence%20Quote%20Pros.%0A%0AName%3A%20%0ACompany%3A%20%0AState%2FCounty%3A%20%0ATypical%20job%20mix%20(wood%2Faluminum%2Fchain%20link%2FPVC)%3A%20%0APreferred%20day%2Ftime%3A%20%0A%0AThanks!"
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
                Email us
              </div>
              <div className="text-sm text-slate-600 mt-1 break-all">
                victor@permitsolutions.us
              </div>
              <div className="text-xs text-brand font-bold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Send a request
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
                Call us
              </div>
              <div className="text-sm text-slate-600 mt-1">305-555-0100</div>
              <div className="text-xs text-brand font-bold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Speak with founder
                <ArrowRight className="w-3 h-3" />
              </div>
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-line text-sm text-slate-600">
            Want to try it before talking?{" "}
            <Link
              href="/signup"
              className="font-bold text-brand hover:text-ink"
            >
              Start the 14-day free trial →
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-6">
          Built in Miami for fence contractors everywhere.
        </div>
      </div>
    </div>
  );
}
