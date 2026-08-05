"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Light/dark toggle — placed in the top-right corner of TopNav, per the wireframe's
 * original theme-toggle switch. Guards against SSR mismatch (next-themes reads the
 * saved preference from localStorage, which doesn't exist during server rendering)
 * by not rendering the actual icon until mounted on the client.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-7 h-7" />; // placeholder to prevent layout shift
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-raised transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
