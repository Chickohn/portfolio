import { AdminLoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  const next = searchParams?.next || "/admin/projects";
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
        <p className="text-gray-300 mb-6">Sign in to manage projects.</p>
        <AdminLoginForm next={next} />
      </div>
    </div>
  );
}

