"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

type UserMeta = { full_name?: string; phone?: string; address?: string };

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [meta, setMeta] = useState<UserMeta>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        const returnTo = searchParams.get("returnTo") || "/profile";
        router.replace(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      setEmail(data.user.email ?? null);
      setMeta((data.user.user_metadata as UserMeta) ?? {});
    });
  }, [router, searchParams]);

  async function updateProfile() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: meta });
      if (error) throw error;
      setEditing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  const hasProfile = Boolean(meta.full_name && meta.phone);

  if (!email) {
    return (
      <div className="flex flex-col items-center text-center mt-10">
        <div className="text-4xl mb-3">🔐</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h1>
        <p className="text-gray-600 mb-4">You need to be signed in to view your profile.</p>
        <Link href="/auth" className="rounded-lg bg-red-600 text-white px-4 py-2">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Profile</h1>
        {hasProfile ? (
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-gray-900 font-medium">{meta.full_name}</div>
            <div className="text-gray-700">{email}</div>
            <div className="text-gray-700">{meta.phone}</div>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-400 p-4 bg-yellow-100 text-gray-900">
            Missing some details. Please
            {" "}
            <Link href="/onboarding" className="text-red-700 underline font-medium">complete your profile</Link>
            {" "}
            to get the best experience.
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Delivery address</h2>
          <button onClick={() => setEditing(!editing)} className="text-sm text-red-600 hover:underline">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={meta.address ?? ""}
              onChange={(e) => setMeta({ ...meta, address: e.target.value })}
              placeholder="Enter your delivery address"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="rounded-lg bg-red-600 text-white px-4 py-2 disabled:opacity-60"
              >
                {loading ? "Saving…" : "Save address"}
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-gray-300 px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            {meta.address ? (
              <div className="text-gray-700">{meta.address}</div>
            ) : (
              <div className="text-gray-600">No address saved yet.</div>
            )}
          </div>
        )}
      </div>

      <button onClick={signOut} className="rounded-lg bg-black text-white px-4 py-2">Sign out</button>
    </div>
  );
} 