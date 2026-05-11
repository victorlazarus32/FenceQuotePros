"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { login, type AuthState } from "./actions";

type LoginFormLabels = {
  emailLabel: string;
  passwordLabel: string;
  submit: string;
  submitPending: string;
};

export function LoginForm({ labels }: { labels: LoginFormLabels }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
        >
          {labels.emailLabel}
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
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
        >
          {labels.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border-2 border-line px-3 py-3 text-base focus:border-brand focus:ring-2 focus:ring-brand outline-none"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-700">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      {state.message && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {state.message}
        </div>
      )}

      <Button type="submit" className="w-full !py-3 text-base" disabled={pending}>
        {pending ? labels.submitPending : `${labels.submit} →`}
      </Button>
    </form>
  );
}
