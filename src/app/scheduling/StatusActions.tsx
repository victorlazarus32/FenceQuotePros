"use client";

import { useTransition } from "react";
import { setJobStatus, unscheduleInstall } from "./actions";

export function StatusActions({
  fenceJobId,
  estimateId,
  current,
}: {
  fenceJobId: string;
  estimateId: string;
  current: "scheduled" | "in_progress" | "completed";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
      {current === "scheduled" && (
        <>
          <button
            type="button"
            onClick={() =>
              startTransition(() => setJobStatus(fenceJobId, "in_progress"))
            }
            disabled={pending}
            className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider hover:bg-emerald-200 disabled:opacity-50"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() =>
              startTransition(() => unscheduleInstall(estimateId))
            }
            disabled={pending}
            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-wider hover:bg-slate-200 disabled:opacity-50"
          >
            Unschedule
          </button>
        </>
      )}
      {current === "in_progress" && (
        <button
          type="button"
          onClick={() =>
            startTransition(() => setJobStatus(fenceJobId, "completed"))
          }
          disabled={pending}
          className="px-2 py-0.5 rounded-full bg-brand text-ink font-bold uppercase tracking-wider hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          Complete
        </button>
      )}
      {current === "completed" && (
        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold uppercase tracking-wider">
          Done
        </span>
      )}
    </div>
  );
}
