import { ClientForm } from "../ClientForm";
import { createClient } from "../actions";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export default async function NewClientPage() {
  const userId = await getCurrentUserId();
  const hoaTemplates = await db.hoaApplicationTemplate.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">New client</h1>
      <ClientForm
        action={createClient}
        cancelHref="/clients"
        submitLabel="Create client"
        hoaTemplates={hoaTemplates}
      />
    </div>
  );
}
