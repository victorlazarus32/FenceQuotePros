"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearSession, setSessionUserId } from "@/lib/session";

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
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, passwordHash: true },
  });

  // Use a generic message for both "no user" and "wrong password" so this
  // route doesn't leak which emails are registered.
  if (!user || !user.passwordHash) {
    return { message: "Email or password is incorrect." };
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { message: "Email or password is incorrect." };
  }

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
    // Setting the password on it lets the original owner "claim" the
    // account (preserves their estimates, profile, signature).
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
