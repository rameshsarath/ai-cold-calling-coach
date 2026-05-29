"use client";

import { logout } from "@/features/auth/actions";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="bg-red-600 text-white rounded px-4 py-2 text-sm"
    >
      Log Out
    </button>
  );
}
