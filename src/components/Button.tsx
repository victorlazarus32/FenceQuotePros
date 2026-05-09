import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-ink focus-visible:ring-brand",
  secondary:
    "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

// Heights tuned for touch — 44px is Apple's minimum tap target. The
// "md" size is the default and sits right at that threshold; "sm" is
// reserved for tight, secondary actions where 36px is acceptable.
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      {...props}
      className={cn(base, variants[variant], sizes[size], className)}
    />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
