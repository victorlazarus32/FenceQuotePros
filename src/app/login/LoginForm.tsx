"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { login } from "./actions";

export function LoginForm() {
  const [, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-md border-2 border-line px-3 py-3 text-base focus:border-brand focus:ring-2 focus:ring-brand outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="anything for now"
          className="w-full rounded-md border-2 border-line px-3 py-3 text-base focus:border-brand focus:ring-2 focus:ring-brand outline-none"
        />
      </div>

      <Button type="submit" className="w-full !py-3 text-base" disabled={pending}>
        {pending ? "Signing in…" : "Sign in →"}
      </Button>
    </form>
  );
}
