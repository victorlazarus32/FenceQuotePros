"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import {
  signPermitDocumentByOwner,
  type OwnerSignDocState,
} from "@/app/estimates/permitDocActions";
import { fieldKey, type PermitDocField } from "@/lib/permitDocs";

type Lang = "en" | "es";

const COPY = {
  en: {
    name_label: "Print full name",
    name_placeholder: "Jane Doe",
    submit: "Sign and submit",
    submitting: "Submitting…",
    error_empty: "Please draw your signature.",
    legal:
      "Your electronic signature has the same legal weight as a wet-ink signature. Date, time, and IP address are recorded.",
  },
  es: {
    name_label: "Nombre completo en letra de molde",
    name_placeholder: "Juana Pérez",
    submit: "Firmar y enviar",
    submitting: "Enviando…",
    error_empty: "Por favor dibuje su firma.",
    legal:
      "Su firma electrónica tiene el mismo valor legal que una firma manuscrita. Se registra la fecha, la hora y la dirección IP.",
  },
} as const;

interface Props {
  token: string;
  documentId: string;
  promptedFields: PermitDocField[];
  initialFieldValues: Record<string, string>;
  lang?: Lang;
}

export function PermitDocSignForm({
  token,
  documentId,
  promptedFields,
  initialFieldValues,
  lang = "en",
}: Props) {
  const t = COPY[lang];
  const padRef = useRef<SignaturePadHandle | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [name, setName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries(
      promptedFields.map((f) => {
        const k = fieldKey(f);
        return [k, initialFieldValues[k] ?? ""];
      }),
    ),
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<
    OwnerSignDocState,
    FormData
  >(signPermitDocumentByOwner, {});

  function handleSubmit(formData: FormData) {
    const dataUrl = padRef.current?.toDataUrl();
    if (!dataUrl) {
      setLocalError(t.error_empty);
      return;
    }
    formData.set("token", token);
    formData.set("documentId", documentId);
    formData.set("signatureDataUrl", dataUrl);
    formData.set("signedByName", name);
    formData.set("fieldValues", JSON.stringify(fieldValues));
    setLocalError(null);
    formAction(formData);
  }

  const error = localError ?? state.message ?? null;

  return (
    <form action={handleSubmit} className="space-y-5">
      {promptedFields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {promptedFields.map((f) => {
            const k = fieldKey(f);
            return (
            <label key={k} className="block">
              <span className="text-xs font-semibold text-slate-700">
                {f.label}
              </span>
              <input
                type={f.inputType === "date" ? "date" : "text"}
                value={fieldValues[k] ?? ""}
                onChange={(e) =>
                  setFieldValues((s) => ({ ...s, [k]: e.target.value }))
                }
                placeholder={f.placeholder}
                className="w-full mt-1"
              />
            </label>
            );
          })}
        </div>
      )}

      <div>
        <SignaturePad
          ariaLabel="Signature"
          placeholder={lang === "es" ? "Firme aquí" : "Sign here"}
          onChange={setHasInk}
          ref={padRef}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          {t.name_label}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.name_placeholder}
          required
          minLength={2}
          className="w-full"
        />
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={pending || !hasInk || name.trim().length < 2}
      >
        {pending ? t.submitting : t.submit}
      </Button>

      <div className="text-[11px] text-slate-500 leading-relaxed">{t.legal}</div>
    </form>
  );
}
