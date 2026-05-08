import { ClientForm } from "../ClientForm";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">New client</h1>
      <ClientForm
        action={createClient}
        cancelHref="/clients"
        submitLabel="Create client"
      />
    </div>
  );
}
