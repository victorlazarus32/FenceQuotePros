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
      <div>
        <div className="text-xs uppercase tracking-wider text-brand font-bold mb-1">
          Fence Project Builder
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Design the fence
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Material → purpose → height → style → color → pricing.
        </p>
      </div>
      <NewEstimateForm clients={clients} defaultClientId={defaultClientId} />
    </div>
  );
}
