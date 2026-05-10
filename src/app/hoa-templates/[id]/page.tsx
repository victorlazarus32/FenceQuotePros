import { notFound } from "next/navigation";
import { getTemplateForUser } from "../actions";
import { TemplateMappingEditor } from "./TemplateMappingEditor";

export default async function HoaTemplateDetailPage(
  props: PageProps<"/hoa-templates/[id]">,
) {
  const { id } = await props.params;
  const template = await getTemplateForUser(id);
  if (!template) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {template.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{template.pdfFilename}</p>
      </div>

      <TemplateMappingEditor
        templateId={template.id}
        initial={{
          name: template.name,
          ownerSignatureFieldName: template.ownerSignatureFieldName ?? null,
          contractorSignatureFieldName:
            template.contractorSignatureFieldName ?? null,
          requiresOwnerSignature: template.requiresOwnerSignature,
          requiresContractorSignature: template.requiresContractorSignature,
          mappings: template.parsedMappings,
        }}
      />
    </div>
  );
}
