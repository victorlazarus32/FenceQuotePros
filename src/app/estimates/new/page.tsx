import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { NewEstimateForm } from "./NewEstimateForm";

export default async function NewEstimatePage(props: PageProps<"/estimates/new">) {
  const userId = await getCurrentUserId();
  const sp = await props.searchParams;
  const defaultClientId =
    typeof sp.clientId === "string" ? sp.clientId : undefined;

  const clients = await db.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New estimate</h1>
      <NewEstimateForm clients={clients} defaultClientId={defaultClientId} />
    </div>
  );
}
