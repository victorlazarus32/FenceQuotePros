import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { Button } from "@/components/Button";
import { updateContractTemplate } from "../../actions";
import { TemplateFormFields } from "../../TemplateFormFields";

export default async function EditContractTemplatePage(
  props: PageProps<"/contracts/[id]/edit">,
) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const userId = await getCurrentUserId();
  const template = await db.contractTemplate.findUnique({ where: { id } });
  if (!template || template.userId !== userId) notFound();

  const update = updateContractTemplate.bind(null, template.id);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/contracts" className="text-sm text-slate-600 hover:text-ink">
          ← Terms &amp; contracts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">
          Edit: {template.name}
        </h1>
      </div>
      {sp?.error && (
        <p className="text-sm text-red-600">
          Please fill in both a name and a body (max 10,000 characters).
        </p>
      )}
      <form
        action={update}
        className="bg-white rounded-lg border border-slate-200 p-6 space-y-6"
      >
        <TemplateFormFields
          defaults={{
            name: template.name,
            body: template.body,
            isDefaultEstimate: template.isDefaultEstimate,
            isDefaultInvoice: template.isDefaultInvoice,
          }}
        />
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
