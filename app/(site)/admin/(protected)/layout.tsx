import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/sign-out-button";

function isAllowedAdminEmail(email: string): boolean {
  const allowed = process.env.ADMIN_EMAIL?.toLowerCase();
  return Boolean(allowed) && email.toLowerCase() === allowed;
}

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/admin/login?next=/admin/projects");
  }
  if (!isAllowedAdminEmail(email)) {
    redirect("/admin/login?next=/admin/projects");
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 to-black/90 -z-10" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/projects" className="text-white font-semibold">
              Admin
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/admin/projects" className="text-gray-300 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/projects" className="text-gray-300 hover:text-white transition-colors">
                View site
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

