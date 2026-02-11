"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      onClick={() => {
        signOut({ callbackUrl: "/admin/login" });
      }}
    >
      Sign out
    </button>
  );
}

