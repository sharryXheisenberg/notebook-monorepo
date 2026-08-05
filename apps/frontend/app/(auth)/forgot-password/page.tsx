"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
    } catch {
      // Intentionally swallowed: show the same confirmation regardless of success/failure
      // or whether the email exists — the backend deliberately never reveals that, so the
      // UI shouldn't either. This also stops any real error (network failure, backend
      // down) from becoming an unhandled promise rejection in the console.
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-3">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-ink-muted">
            If an account exists for {email}, a password reset link has been sent. It expires in 30 minutes.
          </p>
          <Link href="/login" className="text-signal text-sm underline">Back to login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Reset your password</h1>
          <p className="text-sm text-ink-muted mt-1">
            Enter your account email and we'll send a reset link.
          </p>
        </div>

        <Input type="email" placeholder="Email" value={email}
               onChange={(e) => setEmail(e.target.value)} required />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>

        <p className="text-sm text-ink-muted text-center">
          <Link href="/login" className="text-signal">Back to login</Link>
        </p>
      </form>
    </main>
  );
}