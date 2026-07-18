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

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);
    try {
      const res = await authApi.register({ username, email, password });
      setAuthToken(res.token);
      setStoredUser(res.user);
      router.push("/notebooks");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(err.body.message ?? "Account already exists");
        } else if (err.status === 400 && err.body.fields) {
          setFieldErrors(err.body.fields);
        } else {
          setError("Something went wrong");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Create your account</h1>

        <div>
          <Input placeholder="Username" value={username}
                 onChange={(e) => setUsername(e.target.value)} required />
          {fieldErrors.username && <p className="text-xs text-red-300 mt-1">{fieldErrors.username}</p>}
        </div>
        <div>
          <Input type="email" placeholder="Email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
          {fieldErrors.email && <p className="text-xs text-red-300 mt-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <Input type="password" placeholder="Password (min. 8 characters)" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
          {fieldErrors.password && <p className="text-xs text-red-300 mt-1">{fieldErrors.password}</p>}
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-sm text-ink-muted text-center">
          Already have an account? <Link href="/login" className="text-signal">Log in</Link>
        </p>
      </form>
    </main>
  );
}
