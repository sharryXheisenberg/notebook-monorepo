"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/types/api-error";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? "This reset link is invalid or has expired — request a new one."
          : "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-ink-muted">This reset link is missing its token.</p>
          <Link href="/forgot-password" className="text-signal underline text-sm">Request a new link</Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-signal">Password updated — redirecting to login…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Set a new password</h1>

        <Input type="password" placeholder="New password (min. 8 characters)" value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </main>
  );
}
