"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LANG_COOKIE, type Lang } from "@/lib/landing/lang";

// One-year persistence — language preference rarely changes for a
// given contractor, so we set it on toggle and forget about it.
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Server Action that toggles or sets the user's language preference
 * cookie, then redirects back to the page they came from. Invoked via
 * a tiny form posted by <LangPill>.
 */
export async function setLangCookie(formData: FormData) {
  const raw = formData.get("lang");
  const next: Lang = raw === "es" ? "es" : "en";
  const target =
    typeof formData.get("next") === "string"
      ? (formData.get("next") as string)
      : "/";

  const store = await cookies();
  store.set(LANG_COOKIE, next, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });

  redirect(target);
}
