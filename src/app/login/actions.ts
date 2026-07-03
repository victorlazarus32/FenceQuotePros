"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { clearSession, setSessionUserId } from "@/lib/session";

// ── Login rate limiting ──
// DB-backed (LoginAttempt) because Vercel serverless has no shared process
// memory. 5 consecutive failures per email in 15 minutes → locked out until
// the window slides. Rows are cleared on successful login.
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_FAILS = 5;

async function isRateLimited(emailKey: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const fails = await db.loginAttempt.count({
    where: { key: emailKey, createdAt: { gt: windowStart } },
  });
  return fails >= RATE_LIMIT_MAX_FAILS;
}

async function recordFailedLogin(emailKey: string): Promise<void> {
  await db.loginAttempt.create({ data: { key: emailKey } });
}

async function clearFailedLogins(emailKey: string): Promise<void> {
  await db.loginAttempt.deleteMany({ where: { key: emailKey } });
}

export type AuthState = {
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "name" | "companyName", string>>;
};

const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: AuthState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "password") {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const { email, password } = parsed.data;
  const emailKey = email.toLowerCase();

  if (await isRateLimited(emailKey)) {
    return {
      message:
        "Too many failed attempts. Try again in 15 minutes, or reset your password.",
    };
  }

  const user = await db.user.findUnique({
    where: { email: emailKey },
    select: { id: true, passwordHash: true },
  });

  // Use a generic message for both "no user" and "wrong password" so this
  // route doesn't leak which emails are registered.
  if (!user || !user.passwordHash) {
    await recordFailedLogin(emailKey);
    return { message: "Email or password is incorrect." };
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await recordFailedLogin(emailKey);
    return { message: "Email or password is incorrect." };
  }

  await clearFailedLogins(emailKey);
  await setSessionUserId(user.id);
  redirect("/");
}

const SignupSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  name: z.string().trim().min(2, "Enter your name.").max(120),
  companyName: z.string().trim().max(120).optional(),
});

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // Private-beta gate: signups are CLOSED unless explicitly opened.
  // Existing accounts are unaffected. Flip SIGNUPS_OPEN=1 to launch.
  if (process.env.SIGNUPS_OPEN !== "1") {
    return {
      message:
        "Fence Quote Pros is in private beta — signups are closed. Reach out for an invite.",
    };
  }
  const parsed = SignupSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    name: formData.get("name") ?? "",
    companyName: formData.get("companyName") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: AuthState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        key === "email" ||
        key === "password" ||
        key === "name" ||
        key === "companyName"
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // If a user already exists for this email…
  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (existing && existing.passwordHash) {
    // Fully registered account — refuse to overwrite.
    return {
      message: "An account already exists for that email. Sign in instead.",
    };
  }

  let userId: string;
  if (existing && !existing.passwordHash) {
    // Legacy / demo account that was provisioned without a password.
    // Claiming it via signup is an account-takeover vector (anyone who knows
    // the email inherits its estimates/signature), so it's CLOSED by default
    // and only allowed when explicitly enabled for a controlled migration.
    if (process.env.ALLOW_ACCOUNT_CLAIM !== "1") {
      return {
        message: "An account already exists for that email. Sign in instead.",
      };
    }
    const updated = await db.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        name: parsed.data.name,
        companyName: parsed.data.companyName ?? null,
      },
      select: { id: true },
    });
    userId = updated.id;
  } else {
    const created = await db.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name,
        companyName: parsed.data.companyName ?? null,
      },
      select: { id: true },
    });
    userId = created.id;
  }

  await setSessionUserId(userId);
  redirect("/");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}

// ── Password reset ──
// Two-step: request (emails a single-use link; only the SHA-256 of the token
// is stored) → reset (validates hash + expiry + single-use, sets the new
// password). The request action ALWAYS returns the same generic success so
// it can't be used to enumerate registered emails.

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export type ResetRequestState = { ok?: boolean; message?: string };

export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = z
    .string()
    .trim()
    .email()
    .safeParse(formData.get("email") ?? "");
  const generic = {
    ok: true,
    message:
      "If an account exists for that email, a reset link is on its way. Check your inbox.",
  };
  if (!parsed.success) return generic;
  const email = parsed.data.toLowerCase();

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return generic;

  // Single active token per user — a new request invalidates older links.
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const raw = randomBytes(32).toString("base64url");
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashResetToken(raw),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3002";
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    if (host) baseUrl = `${proto}://${host}`;
  } catch {
    // outside a request context; keep the env fallback
  }
  const resetUrl = `${baseUrl}/reset-password/${raw}`;

  // Sent directly (not recorded as an EmailMessage) so the tokenized link
  // never sits in the database.
  const result = await sendMail({
    to: email,
    subject: "Reset your Fence Quote Pros password",
    text: [
      "Hi,",
      "",
      "Someone (hopefully you) asked to reset the password for this Fence Quote Pros account.",
      "",
      `Reset it here (link valid for 1 hour):`,
      "",
      `  ${resetUrl}`,
      "",
      "If you didn't ask for this, you can safely ignore this email — your password is unchanged.",
    ].join("\n"),
  });
  if (!result.ok) {
    // Keep the response generic regardless; log for the operator.
    console.error("password-reset email failed:", result.error);
  }
  return generic;
}

export type ResetPasswordState = {
  message?: string;
  fieldErrors?: Partial<Record<"password" | "confirm", string>>;
};

const ResetPasswordSchema = z
  .object({
    token: z.string().min(16),
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = ResetPasswordSchema.safeParse({
    token: formData.get("token") ?? "",
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: ResetPasswordState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "password" || key === "confirm") {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      fieldErrors,
      message: Object.keys(fieldErrors).length ? undefined : "Invalid request.",
    };
  }

  const row = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(parsed.data.token) },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return {
      message:
        "This reset link is invalid or has expired. Request a new one from the login page.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.$transaction([
    db.user.update({
      where: { id: row.user.id },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    db.passwordResetToken.deleteMany({
      where: { userId: row.user.id, id: { not: row.id } },
    }),
    // A successful reset also unlocks any rate-limited login window.
    db.loginAttempt.deleteMany({ where: { key: row.user.email } }),
  ]);

  redirect("/login?reset=1");
}
