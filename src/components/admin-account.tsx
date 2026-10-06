"use client";

import { useState } from "react";

export function AdminAccount({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSuccess(false);
    setMessage("Updating password…");

    try {
      const response = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The password could not be changed.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The password could not be changed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p className="eyebrow">Security</p>
      <h1 className="display mt-3 text-6xl">Account</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-black/60">
        Change the password for <strong>{email}</strong>. You will use the new password the
        next time you sign in.
      </p>

      <form onSubmit={submit} className="card mt-8 grid max-w-xl gap-5 p-6 md:p-8">
        <div className="field">
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <small className="text-black/50">
            Use at least 12 characters with uppercase, lowercase and a number.
          </small>
        </div>
        <div className="field">
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
        <p
          className={`min-h-5 text-sm ${success ? "text-green-700" : "text-red-700"}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
        <button className="btn btn-lime justify-self-start" disabled={saving}>
          {saving ? "Changing password…" : "Change password"}
        </button>
      </form>
    </>
  );
}
