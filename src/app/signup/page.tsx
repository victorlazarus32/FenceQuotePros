import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/session";
import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Sign up — Fence Quote Pros",
};

export default async function SignupPage() {
  if (await isLoggedIn()) redirect("/");

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-ink text-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/landing"
          className="flex items-center gap-2 mb-10 justify-center"
          aria-label="Fence Quote Pros home"
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
            Create account
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            14-day free trial. No card required.
          </p>

          <SignupForm />

          <div className="mt-5 text-xs text-slate-500 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-semibold">
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
