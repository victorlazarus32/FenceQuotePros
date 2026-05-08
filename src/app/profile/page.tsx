// Contractor profile page. Currently focused on the saved e-signature
// used for permit-packet documents. Other profile fields (license #,
// company info, branding) can be added here over time.

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { isLoggedIn } from "@/lib/session";
import { ContractorSignatureForm } from "@/components/ContractorSignatureForm";
import { ContractorProfileForm } from "@/components/ContractorProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!(await isLoggedIn())) redirect("/login");
  const userId = await getCurrentUserId();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      companyName: true,
      email: true,
      phone: true,
      addressLine1: true,
      city: true,
      state: true,
      zip: true,
      licenseNumber: true,
      qualifierLast4: true,
      signatureDataUrl: true,
      signatureName: true,
      signatureSavedAt: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="h-page text-ink">Profile</h1>
        <p className="text-sm text-slate-600 mt-1">
          {user.name ?? user.email}
          {user.companyName && <> · {user.companyName}</>}
        </p>
      </header>

      <section className="rounded-lg border-2 border-line bg-white p-6">
        <div className="mb-4">
          <h2 className="h-card text-ink">Contractor information</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md">
            Auto-fills the Contractor Information box on every Miami-Dade
            permit application you generate. Fill it out once.
          </p>
        </div>
        <ContractorProfileForm
          initial={{
            name: user.name,
            companyName: user.companyName,
            phone: user.phone,
            addressLine1: user.addressLine1,
            city: user.city,
            state: user.state,
            zip: user.zip,
            licenseNumber: user.licenseNumber,
            qualifierLast4: user.qualifierLast4,
          }}
        />
      </section>

      <section className="rounded-lg border-2 border-line bg-white p-6">
        <div className="mb-4">
          <h2 className="h-card text-ink">Saved signature</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md">
            Used to auto-sign permit documents like the Miami-Dade Sec.
            33-11 fence addendum and the Permit Application qualifier line.
            Sign once here — it's applied to every contractor signature line
            on documents you generate.
          </p>
        </div>
        <ContractorSignatureForm
          initialName={user.signatureName ?? user.name ?? ""}
          hasExisting={Boolean(user.signatureDataUrl)}
          existingDataUrl={user.signatureDataUrl}
          existingName={user.signatureName}
          existingSavedAt={user.signatureSavedAt}
        />
      </section>
    </div>
  );
}
