import "server-only";
import { db } from "./db";
import { getSession } from "./session";

// Reads the authenticated user from the session cookie. Throws if no
// session is present — callers in protected routes should check
// isLoggedIn() first (or rely on the layout / page-level redirect).

export async function getCurrentUserId(): Promise<string> {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("Not authenticated");
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
