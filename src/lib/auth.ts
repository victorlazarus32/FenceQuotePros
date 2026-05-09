import "server-only";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSession } from "./session";

// Reads the authenticated user from the session cookie. If there's no
// session, this redirects to /login (rather than throwing) so pages
// don't have to guard with isLoggedIn() before calling — any protected
// page can call getCurrentUserId() at the top and the framework handles
// the redirect via its internal exception signal.

export async function getCurrentUserId(): Promise<string> {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  return session.userId;
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  return db.user.findUniqueOrThrow({ where: { id } });
}

/** Optional version that returns null instead of throwing. */
export async function tryGetCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session.userId ?? null;
}
