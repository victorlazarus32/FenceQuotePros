import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

// Session is an encrypted cookie holding the logged-in user's id. iron-session
// uses authenticated AES encryption so the cookie value is opaque to the
// browser and tamper-evident — flipping a byte invalidates the session.
//
// SESSION_SECRET must be ≥32 bytes; rotate by changing the env var (every
// active session becomes invalid).

export interface SessionPayload {
  userId?: string;
}

const COOKIE_NAME = "fqp_session";

function getOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters. " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return {
    password,
    cookieName: COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  };
}

export async function getSession() {
  const c = await cookies();
  return getIronSession<SessionPayload>(c, getOptions());
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session.userId);
}

export async function setSessionUserId(userId: string): Promise<void> {
  const session = await getSession();
  session.userId = userId;
  await session.save();
}

export async function clearSession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
