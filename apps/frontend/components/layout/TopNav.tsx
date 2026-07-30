"use client";

import { Search, Share2, History, Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth/cookies";
import { clearStoredUser, getStoredUser } from "@/lib/auth/session";

interface TopNavProps {
  onShareClick?: () => void;
}

/**
 * Richer top bar matching the wireframe: global search, a primary "Share & Collaborate"
 * action, and utility icons (history, notifications, profile). History and notifications
 * are v1.5/v2 features with no backend yet — shown disabled rather than omitted, so the
 * layout matches the target design while being honest about what's wired up.
 */
export function TopNav({ onShareClick }: TopNavProps) {
  const router = useRouter();
  const user = getStoredUser();

  function handleLogout() {
    clearAuthToken();
    clearStoredUser();
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-border-subtle">
      <span className="font-semibold text-sm shrink-0">Notebook</span>

      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          placeholder="Search across notebooks, code, comments"
          className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border-subtle text-sm placeholder:text-ink-muted focus:border-signal focus:ring-1 focus:ring-signal"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onShareClick}
          className="flex items-center gap-1.5 bg-signal text-canvas text-sm font-medium px-3 py-1.5 rounded-md hover:bg-signal/90"
        >
          <Share2 size={14} /> Share & Collaborate
        </button>

        <button disabled className="text-ink-muted/40 p-1.5 cursor-not-allowed" title="Version history — v1.5">
          <History size={16} />
        </button>
        <button disabled className="text-ink-muted/40 p-1.5 cursor-not-allowed" title="Notifications — v2">
          <Bell size={16} />
        </button>

        <button onClick={handleLogout} className="flex items-center gap-1.5 text-ink-muted hover:text-ink-primary text-sm pl-1">
          <User size={16} />
          {user?.username}
        </button>
      </div>
    </nav>
  );
}
