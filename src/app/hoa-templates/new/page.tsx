import { NewHoaTemplateForm } from "./NewHoaTemplateForm";
import { createHoaTemplate } from "../actions";

export default function NewHoaTemplatePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New HOA application template
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload the source PDF — typically a fillable AcroForm. We&apos;ll
          extract the field names so you can map them to estimate data on
          the next page.
        </p>
      </div>
      <NewHoaTemplateForm action={createHoaTemplate} />
    </div>
  );
}
