"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { createCrew, type CreateCrewState } from "./actions";

export function CrewForm() {
  const [state, formAction, pending] = useActionState<
    CreateCrewState,
    FormData
  >(createCrew, {});

  return (
    <form action={formAction} className="flex items-end gap-2 flex-wrap">
      <div className="grow min-w-[180px]">
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Crew name
        </label>
        <input
          name="name"
          type="text"
          placeholder='e.g. "Crew A"'
          required
          className="w-full"
        />
      </div>
      <div className="w-32">
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Color tag
        </label>
        <input
          name="colorTag"
          type="text"
          placeholder="#0e7490"
          className="w-full font-mono"
        />
      </div>
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Adding…" : "Add crew"}
      </Button>
      {state.message && (
        <div className="text-xs text-red-700 w-full">{state.message}</div>
      )}
    </form>
  );
}
