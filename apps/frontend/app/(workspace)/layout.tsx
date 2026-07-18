"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth/cookies";
import { clearStoredUser, getStoredUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = getStoredUser();

  function handleLogout() {
    clearAuthToken();
    clearStoredUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <Link href="/notebooks" className="font-semibold">Notebook</Link>
          <Link href="/notebooks" className="text-sm text-ink-muted hover:text-ink-primary">Notebooks</Link>
          <Link href="/skills" className="text-sm text-ink-muted hover:text-ink-primary">Skills</Link>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-ink-muted">{user.username}</span>}
          <Button variant="ghost" onClick={handleLogout}>Log out</Button>
        </div>
      </nav>
      {children}
    </div>
  );
}
