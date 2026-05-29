"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/features/auth/actions";

export function SignupForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(signup, undefined);

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard/manager");
    }
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold">Manager Sign Up</h1>

      <label htmlFor="fullName">Full Name</label>
      <input
        id="fullName"
        name="fullName"
        type="text"
        required
        className="border rounded px-3 py-2"
      />

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
        {pending ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 underline">
          Log in
        </a>
      </p>
    </form>
  );
}
