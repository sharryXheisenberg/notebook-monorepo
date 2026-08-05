"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { setAuthToken } from "@/lib/auth/cookies";
import { setStoredUser } from "@/lib/auth/session";
import { ApiError } from "@/types/api-error";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuthToken(res.token);
      setStoredUser(res.user);
      router.push("/notebooks");
    } catch (err) {
      setError(err instanceof ApiError ? "Invalid email or password" : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Log in</h1>

        <Input type="email" placeholder="Email" value={email}
               onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password}
               onChange={(e) => setPassword(e.target.value)} required />

        <div className="text-right -mt-2">
          <Link href="/forgot-password" className="text-xs text-ink-muted hover:text-ink-primary underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Logging in…" : "Log in"}
        </Button>

        <p className="text-sm text-ink-muted text-center">
          No account? <Link href="/register" className="text-signal">Create one</Link>
        </p>
      </form>
    </main>
  );
}
