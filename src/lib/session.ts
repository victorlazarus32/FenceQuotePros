import "server-only";
import { cookies } from "next/headers";

// Placeholder auth — accepts anything. Just sets a cookie that gates the
// dashboard until real auth is wired up.
const COOKIE = "fqp_auth";

export async function isLoggedIn(): Promise<boolean> {
  const c = await cookies();
  return c.get(COOKIE)?.value === "1";
}

export async function setLoggedIn(): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}
