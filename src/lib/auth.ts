import "server-only";
import { db } from "./db";

// MVP placeholder: single demo user. Real auth (NextAuth or similar) is a
// follow-up; everything is scoped through getCurrentUserId so it's easy to swap.
const DEMO_EMAIL = "demo@fencequote.app";

export async function getCurrentUserId(): Promise<string> {
  let user = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: DEMO_EMAIL,
        name: "Demo Contractor",
        companyName: "Demo Fence Co.",
        phone: "(555) 123-4567",
        addressLine1: "123 Main St",
        city: "Anytown",
        state: "TX",
        zip: "75001",
      },
    });
  }
  return user.id;
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  return db.user.findUniqueOrThrow({ where: { id } });
}
