import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { LinkButton } from "@/components/Button";

export const metadata = {
  title: "HOA application templates — Fence Quote Pros",
};

export default async function HoaTemplatesPage() {
  const userId = await getCurrentUserId();
  const templates = await db.hoaApplicationTemplate.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { clients: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            HOA application templates
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload an association&apos;s ARC application PDF once, map its
            fields to your client + estimate data, then auto-fill it for
            every client tied to that HOA.
          </p>
        </div>
        <LinkButton href="/hoa-templates/new">+ New template</LinkButton>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm text-slate-600">
            No HOA templates yet. Upload your first association&apos;s
            application PDF to get started.
          </p>
        </div>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {templates.map((t) => (
            <li key={t.id}>
              <Link
                href={`/hoa-templates/${t.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50"
              >
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t.pdfFilename}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {t._count.clients === 0
                    ? "Not assigned"
                    : `${t._count.clients} ${t._count.clients === 1 ? "client" : "clients"}`}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
