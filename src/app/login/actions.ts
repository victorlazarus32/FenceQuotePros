"use server";

import { redirect } from "next/navigation";
import { clearSession, setLoggedIn } from "@/lib/session";

// Placeholder: accepts anything. Real auth (NextAuth, Clerk, custom) is a
// follow-up — every check goes through `isLoggedIn()` so swapping later
// touches one file.
export async function login(_prev: unknown, _formData: FormData) {
  await setLoggedIn();
  redirect("/");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
