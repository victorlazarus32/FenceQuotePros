"use server";

// Job-workflow server actions: manual stage transitions + task CRUD.
// Transition rules live in lib/jobWorkflow (pure, tested); the single DB
// write path is lib/workflowDb.applyWorkflowTransition.

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { applyWorkflowTransition } from "@/lib/workflowDb";

export type WorkflowActionState = { message?: string };

export async function transitionJobWorkflow(
  _prev: WorkflowActionState,
  formData: FormData,
): Promise<WorkflowActionState> {
  const userId = await getCurrentUserId();
  const estimateId = String(formData.get("estimateId") ?? "");
  const to = String(formData.get("to") ?? "");
  const est = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { id: true, userId: true, workflowStatus: true },
  });
  if (!est || est.userId !== userId) return { message: "Not found" };

  const result = await applyWorkflowTransition(est, to, "manual");
  if (!result.ok) return { message: result.reason };

  revalidatePath(`/estimates/${est.id}`);
  revalidatePath("/jobs");
  revalidatePath("/");
  return {};
}

export async function addJobTask(
  _prev: WorkflowActionState,
  formData: FormData,
): Promise<WorkflowActionState> {
  const userId = await getCurrentUserId();
  const estimateId = String(formData.get("estimateId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const dueRaw = String(formData.get("dueDate") ?? "").trim();
  if (!title) return { message: "Task title is required." };
  if (title.length > 200) return { message: "Task title is too long." };

  const est = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { id: true, userId: true },
  });
  if (!est || est.userId !== userId) return { message: "Not found" };

  await db.jobTask.create({
    data: {
      userId,
      estimateId: est.id,
      title,
      dueAt: dueRaw ? new Date(`${dueRaw}T12:00:00`) : null,
    },
  });
  revalidatePath(`/estimates/${est.id}`);
  revalidatePath("/");
  return {};
}

export async function toggleJobTask(taskId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const task = await db.jobTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) return;
  await db.jobTask.update({
    where: { id: task.id },
    data: { completedAt: task.completedAt ? null : new Date() },
  });
  revalidatePath(`/estimates/${task.estimateId}`);
  revalidatePath("/");
}

export async function deleteJobTask(taskId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const task = await db.jobTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) return;
  await db.jobTask.delete({ where: { id: task.id } });
  revalidatePath(`/estimates/${task.estimateId}`);
  revalidatePath("/");
}
