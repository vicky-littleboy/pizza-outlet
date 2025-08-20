"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      }
      const { data } = await supabase.auth.getUser();
      const meta = (data.user?.user_metadata ?? {}) as { full_name?: string; phone?: string };
      if (!meta.full_name || !meta.phone) {
        router.replace("/onboarding");
      } else {
        // For sign-up, always redirect to home page
        if (mode === "signup") {
          router.replace("/");
        } else {
          const returnTo = searchParams.get("returnTo") || "/";
          router.replace(returnTo);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Card - Company Logo (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-red-800 items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="mb-8">
            <Image
              src="https://franchisekhoj.com/wp-content/uploads/2022/05/GO-69-Pizza-01.webp"
              alt="GO-69 Pizza Logo"
              width={300}
              height={200}
              className="rounded-lg shadow-lg mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to GO-69 Pizza</h1>
          <p className="text-xl text-red-100">Delicious pizza delivered to your door</p>
        </div>
      </div>

      {/* Right Card - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="text-sm text-gray-500 mb-6">{mode === "login" ? "Sign in to continue" : "Sign up to get started"}</p>

          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-600 text-white py-2.5 font-medium hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            {mode === "login" ? (
              <span>
                Don&apos;t have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-red-600 hover:underline">Sign up</button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-red-600 hover:underline">Sign in</button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 