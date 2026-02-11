import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const allowed = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!allowed || session.user.email.toLowerCase() !== allowed) {
    throw new Error("Forbidden");
  }

  return session;
}

