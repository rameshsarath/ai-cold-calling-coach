"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(login, undefined);

  useEffect(() => {
    if (state?.success) {
      router.push(state.redirectTo ?? "/dashboard/manager");
    }
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold">Sign in to your account</h1>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        className="border rounded px-3 py-2"
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="border rounded px-3 py-2"
      />

      {"error" in (state ?? {}) && state?.error && (
        <p className="text-red-600 text-sm">{state.error.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Logging in..." : "Log In"}
      </button>

      <p className="text-sm text-center">
        No account?{" "}
        <a href="/signup" className="text-blue-600 underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
