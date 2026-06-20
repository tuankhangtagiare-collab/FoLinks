import { auth } from "../auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user as any;
}

export async function requireRole(roles: ("USER" | "ADMIN" | "SUPER_ADMIN")[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes((user as any).role)) {
    throw new Error("Forbidden");
  }
  return user as any;
}
