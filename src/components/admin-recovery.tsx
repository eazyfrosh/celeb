"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminRecovery() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Resetting password…");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/setup/reset-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The password could not be reset.");
      setMessage("Password reset. Opening the admin dashboard…");
      router.push("/admin/account?recovered=1");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The password could not be reset.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-auto bg-[#171713] p-5">
      <form
        onSubmit={submit}
        className="mx-auto my-8 grid w-full max-w-lg gap-5 rounded-2xl bg-[#f4f0e8] p-8"
      >
        <div>
          <p className="text-xl font-black tracking-[-.07em]">
            VELAIRE<span className="text-[#ff6b55]">●</span>
          </p>
          <h1 className="display mt-8 text-5xl">Recover admin access</h1>
          <p className="mt-3 text-sm leading-6 text-black/55">
            Use the temporary value configured as <code>ADMIN_SETUP_KEY</code> in Vercel.
            Remove that environment variable and redeploy after recovery.
          </p>
        </div>
        <div className="field">
          <label htmlFor="recovery-email">Admin email</label>
          <input id="recovery-email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="recovery-key">Admin recovery key</label>
          <input
            id="recovery-key"
            name="recoveryKey"
            type="password"
            autoComplete="off"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="recovery-password">New password</label>
          <input
            id="recovery-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
          />
          <small className="text-black/50">
            At least 12 characters with uppercase, lowercase and a number.
          </small>
        </div>
        <div className="field">
          <label htmlFor="recovery-confirm">Confirm new password</label>
          <input
            id="recovery-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
          />
        </div>
        <p className="min-h-5 text-sm text-red-700" role="alert" aria-live="polite">
          {message}
        </p>
        <button className="btn btn-lime" disabled={saving}>
          {saving ? "Resetting password…" : "Reset password"}
        </button>
        <Link href="/admin/login" className="text-center text-sm font-bold underline">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
