"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Calendar, Wrench } from "lucide-react";
import { Button } from "@/components/Button";
import {
  scheduleInstall,
  unscheduleInstall,
  type ScheduleInstallState,
} from "@/app/scheduling/actions";

interface Props {
  estimateId: string;
  fenceJobId: string;
  initialDate: string | null; // YYYY-MM-DD
  initialCrewId: string | null;
  installStatus: string;
  crews: Array<{ id: string; name: string; colorTag: string | null }>;
}

export function ScheduleInstallPanel({
  estimateId,
  initialDate,
  initialCrewId,
  installStatus,
  crews,
}: Props) {
  const [state, formAction, pending] = useActionState<
    ScheduleInstallState,
    FormData
  >(scheduleInstall, {});

  const isScheduled = installStatus !== "unscheduled";

  return (
    <div className="rounded-lg border-2 border-line bg-white p-5 no-print">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-brand" />
        <h3 className="h-card text-ink">
          {isScheduled ? "Install scheduled" : "Schedule install"}
        </h3>
      </div>

      <form action={formAction} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <input type="hidden" name="estimateId" value={estimateId} />
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Install date
          </label>
          <input
            name="scheduledDate"
            type="date"
            defaultValue={initialDate ?? ""}
            required
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Crew
          </label>
          <select
            name="crewId"
            defaultValue={initialCrewId ?? ""}
            className="w-full"
          >
            <option value="">— Unassigned —</option>
            {crews.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : isScheduled
              ? "Update"
              : "Schedule"}
        </Button>
      </form>

      {state.message && (
        <div className="mt-3 text-sm text-red-700">{state.message}</div>
      )}
      {state.ok && (
        <div className="mt-3 text-sm text-emerald-800">
          Saved.{" "}
          <Link href="/scheduling" className="underline font-semibold">
            View production board →
          </Link>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-slate-600">
          Status:{" "}
          <span className="font-bold text-ink uppercase tracking-wider">
            {installStatus.replace("_", " ")}
          </span>
        </div>
        <div className="flex gap-2">
          {isScheduled && (
            <form action={unscheduleInstall.bind(null, estimateId)}>
              <Button variant="secondary" size="sm" type="submit">
                <Wrench className="w-3.5 h-3.5 mr-1" />
                Unschedule
              </Button>
            </form>
          )}
          <Link
            href="/scheduling"
            className="inline-flex items-center px-3 py-2 rounded-md border-2 border-line text-sm font-semibold text-slate-700 hover:border-ink"
          >
            Production board →
          </Link>
        </div>
      </div>
    </div>
  );
}
