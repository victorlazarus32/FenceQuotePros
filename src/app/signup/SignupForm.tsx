"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { signup, type AuthState } from "@/app/login/actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
          >
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Victor Moreno"
            className="w-full rounded-md border-2 border-line px-3 py-3 text-base focus:border-brand focus:ring-2 focus:ring-brand outline-none"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-700">
              {state.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="companyName"
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
          >
            Company (optional)
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            placeholder="Allday Fence Co."
            className="w-full rounded-md border-2 border-line px-3 py-3 text-base focus:border-brand focus:ring-2 focus:ring-brand outline-none"
          />
          {state.fieldErrors?.companyName && (
            <p className="mt-1 text-xs text-red-700">
              {state.fieldErrors.companyName}
            </p>
          )}
        </div>
      </div>

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
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.email}</p>
        )}
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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Minimum 8 characters"
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
        {pending ? "Creating account…" : "Create account →"}
      </Button>
    </form>
  );
}
