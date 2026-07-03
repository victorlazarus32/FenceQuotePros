// Terms & contract template library. Templates auto-apply to new estimates
// and invoice conversions when marked default; {{variables}} render at
// apply time (unknown ones stay visible on the document).

import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { Button, LinkButton } from "@/components/Button";
import { listVariables } from "@/lib/contractTemplates";
import { deleteContractTemplate } from "./actions";

export default async function ContractsPage() {
  const userId = await getCurrentUserId();
  const templates = await db.contractTemplate.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Terms &amp; contracts
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Reusable terms blocks. Defaults auto-fill new estimates and
            invoices; <span className="font-mono text-xs">{"{{client_name}}"}</span>,{" "}
            <span className="font-mono text-xs">{"{{total}}"}</span>,{" "}
            <span className="font-mono text-xs">{"{{deposit}}"}</span> etc.
            fill in automatically.
          </p>
        </div>
        <LinkButton href="/contracts/new" variant="primary" size="sm">
          + New template
        </LinkButton>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
          <p className="text-slate-600">
            No templates yet. Create one and mark it default — every new
            estimate picks it up automatically.
          </p>
          <Link
            href="/contracts/new"
            className="inline-block mt-3 text-sm font-medium text-brand"
          >
            New template →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {templates.map((t) => {
            const vars = listVariables(t.body);
            return (
              <li
                key={t.id}
                className="bg-white rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{t.name}</span>
                      {t.isDefaultEstimate && (
                        <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 text-xs font-medium">
                          Default · estimates
                        </span>
                      )}
                      {t.isDefaultInvoice && (
                        <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-medium">
                          Default · invoices
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2 whitespace-pre-wrap">
                      {t.body}
                    </p>
                    {vars.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {vars.map((v) => `{{${v}}}`).join(" ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <LinkButton
                      href={`/contracts/${t.id}/edit`}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </LinkButton>
                    <form action={deleteContractTemplate.bind(null, t.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
