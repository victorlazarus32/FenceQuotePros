import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ClientForm } from "../../ClientForm";
import { updateClient } from "../../actions";

export default async function EditClientPage(props: PageProps<"/clients/[id]/edit">) {
  const { id } = await props.params;
  const userId = await getCurrentUserId();
  const client = await db.client.findUnique({ where: { id } });
  if (!client || client.userId !== userId) notFound();

  const action = updateClient.bind(null, id);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Edit {client.name}</h1>
      <ClientForm
        action={action}
        initial={client}
        cancelHref={`/clients/${id}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
