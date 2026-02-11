import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function isAllowedAdminEmail(email: string): boolean {
  const allowed = getRequiredEnv("ADMIN_EMAIL").toLowerCase();
  return email.toLowerCase() === allowed;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Owner",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        if (!isAllowedAdminEmail(email)) return null;

        const expectedPassword = getRequiredEnv("ADMIN_PASSWORD");
        if (password !== expectedPassword) return null;

        return { id: "owner", email };
      },
    }),
  ],
};

