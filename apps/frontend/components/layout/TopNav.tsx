"use client";

import { Search, Share2, History, Bell, LogOut, NotebookPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth/cookies";
import { clearStoredUser, getStoredUser } from "@/lib/auth/session";

interface TopNavProps {
  onShareClick?: () => void;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/**
 * Top bar — reworked for actual visual hierarchy: a real wordmark treatment, a search
 * field with depth instead of a flat outline, clearly-grouped sections separated by
 * dividers, an avatar instead of a generic icon, and logout split out as its own control
 * instead of being bundled into the same clickable area as the username (which read as
 * "does clicking my name log me out?" — an actual usability problem, not just polish).
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
    <nav className="sticky top-0 z-40 flex items-center gap-4 px-5 py-3 border-b border-border-subtle bg-canvas/80 backdrop-blur-sm">
      {/* Wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-annotation/15 text-annotation">
          <NotebookPen size={15} />
        </div>
        <span className="font-semibold text-sm tracking-tight">Notebook</span>
      </div>

      <div className="w-px h-6 bg-border-subtle" />

      {/* Search */}
      <div className="flex-1 max-w-md relative group">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-signal transition-colors"
        />
        <input
          placeholder="Search across notebooks, code, comments"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border-subtle text-sm placeholder:text-ink-muted
                     shadow-sm focus:outline-none focus:border-signal focus:ring-2 focus:ring-signal/20 transition-shadow"
        />
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onShareClick}
          className="flex items-center gap-1.5 bg-annotation text-canvas text-sm font-medium px-3.5 py-2 rounded-lg
                     hover:bg-annotation/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <Share2 size={14} /> Share & Collaborate
        </button>

        <div className="flex items-center gap-1">
          <button
            disabled
            title="Version history — coming in v1.5"
            className="p-2 rounded-md text-ink-muted/50 hover:bg-surface-raised/60 cursor-default"
          >
            <History size={16} />
          </button>
          <button
            disabled
            title="Notifications — coming in v2"
            className="p-2 rounded-md text-ink-muted/50 hover:bg-surface-raised/60 cursor-default"
          >
            <Bell size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-border-subtle" />

        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full bg-signal/15 text-signal text-xs font-semibold shrink-0"
            title={user?.username}
          >
            {user ? initials(user.username) : "?"}
          </div>
          <span className="text-sm text-ink-primary hidden sm:inline">{user?.username}</span>

          <button
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="p-2 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-raised transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}
