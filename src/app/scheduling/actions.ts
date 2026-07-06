"use server";

// Production scheduling actions. Lightweight by design — no recurring
// rules, no skill-based matching, no time-of-day, no Calendar API
// integration. Just enough to assign a job to a crew on a specific
// date and walk it through scheduled → in_progress → completed.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// ── Crews ────────────────────────────────────────────────────────

const CreateCrewSchema = z.object({
  name: z.string().trim().min(1, "Name a crew.").max(80),
  colorTag: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/u, "Pick a 6-digit hex color (e.g. #0e7490).")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CreateCrewState = { ok?: boolean; message?: string };

export async function createCrew(
  _prev: CreateCrewState,
  formData: FormData,
): Promise<CreateCrewState> {
  const userId = await getCurrentUserId();
  const parsed = CreateCrewSchema.safeParse({
    name: formData.get("name") ?? "",
    colorTag: formData.get("colorTag") ?? "",
  });
  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Invalid crew.",
    };
  }
  await db.crew.create({
    data: {
      userId,
      name: parsed.data.name,
      colorTag: parsed.data.colorTag ?? null,
    },
  });
  revalidatePath("/scheduling");
  return { ok: true };
}

export async function archiveCrew(crewId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const crew = await db.crew.findUnique({
    where: { id: crewId },
    select: { userId: true },
  });
  if (!crew || crew.userId !== userId) return;
  await db.crew.update({
    where: { id: crewId },
    data: { active: false },
  });
  revalidatePath("/scheduling");
}

// ── Schedule install ─────────────────────────────────────────────

const ScheduleInstallSchema = z.object({
  estimateId: z.string().min(1),
  // Date string YYYY-MM-DD coming from <input type="date"> — coerce
  // into a Date at noon UTC so timezone shifts don't kick it to the
  // previous day in negative-offset zones.
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u, "Pick a date.")
    .transform((s) => new Date(`${s}T12:00:00.000Z`)),
  crewId: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export type ScheduleInstallState = { ok?: boolean; message?: string };

export async function scheduleInstall(
  _prev: ScheduleInstallState,
  formData: FormData,
): Promise<ScheduleInstallState> {
  const userId = await getCurrentUserId();
  const parsed = ScheduleInstallSchema.safeParse({
    estimateId: formData.get("estimateId"),
    scheduledDate: formData.get("scheduledDate"),
    crewId: formData.get("crewId") ?? "",
  });
  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Couldn't schedule.",
    };
  }
  const { estimateId, scheduledDate, crewId } = parsed.data;

  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { userId: true, fenceJobs: { select: { id: true } } },
  });
  if (!estimate || estimate.userId !== userId) {
    return { message: "Estimate not found." };
  }
  const fenceJob = estimate.fenceJobs[0];
  if (!fenceJob) {
    return { message: "This estimate has no fence job to schedule." };
  }

  if (crewId) {
    const crew = await db.crew.findUnique({
      where: { id: crewId },
      select: { userId: true },
    });
    if (!crew || crew.userId !== userId) {
      return { message: "Crew not found." };
    }
  }

  await db.fenceJob.update({
    where: { id: fenceJob.id },
    data: {
      scheduledDate,
      crewId: crewId ?? null,
      installStatus: "scheduled",
    },
  });

  revalidatePath("/scheduling");
  revalidatePath(`/estimates/${estimateId}`);
  return { ok: true };
}

export async function unscheduleInstall(estimateId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { userId: true, fenceJobs: { select: { id: true } } },
  });
  if (!estimate || estimate.userId !== userId) return;
  const fenceJob = estimate.fenceJobs[0];
  if (!fenceJob) return;
  await db.fenceJob.update({
    where: { id: fenceJob.id },
    data: {
      scheduledDate: null,
      crewId: null,
      installStatus: "unscheduled",
    },
  });
  revalidatePath("/scheduling");
  revalidatePath(`/estimates/${estimateId}`);
}

// ── Status transitions ───────────────────────────────────────────

type InstallStatus =
  | "unscheduled"
  | "scheduled"
  | "in_progress"
  | "completed";

export async function setJobStatus(
  fenceJobId: string,
  next: InstallStatus,
): Promise<void> {
  const userId = await getCurrentUserId();
  const job = await db.fenceJob.findUnique({
    where: { id: fenceJobId },
    select: {
      id: true,
      estimate: { select: { userId: true, id: true } },
    },
  });
  if (!job || job.estimate.userId !== userId) return;
  await db.fenceJob.update({
    where: { id: fenceJobId },
    data: {
      installStatus: next,
      completedAt: next === "completed" ? new Date() : null,
    },
  });
  revalidatePath("/scheduling");
  revalidatePath(`/estimates/${job.estimate.id}`);
}

export async function scheduleInstallAndRedirect(
  formData: FormData,
): Promise<void> {
  const result = await scheduleInstall({}, formData);
  if (result.ok) {
    redirect("/scheduling");
  }
}
