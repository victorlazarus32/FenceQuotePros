import Link from "next/link";
import { Button } from "@/components/Button";
import { createContractTemplate } from "../actions";
import { TemplateFormFields } from "../TemplateFormFields";

export default async function NewContractTemplatePage(
  props: PageProps<"/contracts/new">,
) {
  const sp = await props.searchParams;
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/contracts" className="text-sm text-slate-600 hover:text-ink">
          ← Terms &amp; contracts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">
          New template
        </h1>
      </div>
      {sp?.error && (
        <p className="text-sm text-red-600">
          Please fill in both a name and a body (max 10,000 characters).
        </p>
      )}
      <form
        action={createContractTemplate}
        className="bg-white rounded-lg border border-slate-200 p-6 space-y-6"
      >
        <TemplateFormFields />
        <Button type="submit">Create template</Button>
      </form>
    </div>
  );
}
