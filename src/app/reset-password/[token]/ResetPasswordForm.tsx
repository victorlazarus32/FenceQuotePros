"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import {
  resetPassword,
  type ResetPasswordState,
} from "@/app/login/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPassword, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-red-600 mt-1">
            {state.fieldErrors.password}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="confirm"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {state.fieldErrors?.confirm && (
          <p className="text-xs text-red-600 mt-1">
            {state.fieldErrors.confirm}
          </p>
        )}
      </div>
      {state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
