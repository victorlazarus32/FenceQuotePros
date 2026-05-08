// Streams the executed permit-doc PDF. Auth: contractor (owns the
// estimate) OR a request that includes the right share token in the
// query string (so the customer can also re-download from /p/<token>).
//
// Reads through the storage abstraction so this works in dev (local
// public/uploads/) and prod (Supabase Storage signed URLs).

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getTemplate } from "@/lib/permitDocs";
import { getStorage } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const document = await db.estimateDocument.findUnique({
    where: { id },
    include: {
      estimate: { select: { userId: true, shareToken: true } },
    },
  });
  if (!document?.generatedPdfKey) {
    return new NextResponse("Not ready", { status: 404 });
  }

  // Authorization: contractor owns the estimate, OR the request carries
  // the correct share token.
  let authorized = false;
  if (token && document.estimate.shareToken === token) {
    authorized = true;
  } else {
    try {
      const userId = await getCurrentUserId();
      if (userId === document.estimate.userId) authorized = true;
    } catch {
      // Not logged in
    }
  }
  if (!authorized) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await getStorage().read(document.generatedPdfKey);
  } catch {
    return new NextResponse("File missing", { status: 404 });
  }

  const template = getTemplate(document.templateSlug);
  const filename = template
    ? `${template.slug}-executed.pdf`
    : "executed.pdf";

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
